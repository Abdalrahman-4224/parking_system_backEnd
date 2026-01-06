const { validationResult } = require('express-validator');
const OTP = require('../models/OTP');
const { generateOTP, sendOTP, getOTPExpiration } = require('../utils/smsService');
const { Op } = require('sequelize');

/**
 * Send OTP to phone number
 * POST /api/v1/otp/send
 */
const sendOTPCode = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phoneNumber } = req.body;

    // Rate limiting: Check if OTP was sent recently (prevent spam)
    const recentOTP = await OTP.findOne({
      where: {
        phoneNumber,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 60 * 1000) // Last 1 minute
        }
      }
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 1 minute before requesting another OTP'
      });
    }

    // Check daily limit (prevent abuse)
    const dailyOTPs = await OTP.count({
      where: {
        phoneNumber,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    if (dailyOTPs >= 10) {
      return res.status(429).json({
        success: false,
        message: 'Maximum OTP requests reached for today. Please try again tomorrow'
      });
    }

    // Generate OTP code
    const otpCode = generateOTP(6);

    // Set expiration (5 minutes)
    const expiresAt = getOTPExpiration(5);

    // Delete any existing unused OTPs for this phone number
    await OTP.destroy({
      where: {
        phoneNumber,
        isUsed: false
      }
    });

    // Save OTP to database
    const otpRecord = await OTP.create({
      phoneNumber,
      otpCode,
      expiresAt,
      isUsed: false,
      attempts: 0,
      purpose: 'registration'
    });

    // Send SMS
    try {
      const smsResult = await sendOTP(phoneNumber, otpCode);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your phone number',
        data: {
          phoneNumber,
          expiresIn: '5 minutes',
          // Only include OTP in development mode for testing
          ...(process.env.NODE_ENV === 'development' && !process.env.SMS_API_KEY && {
            otpCode // Remove this in production!
          })
        }
      });
    } catch (smsError) {
      // If SMS fails, delete the OTP record
      await otpRecord.destroy();

      console.error('SMS sending failed:', smsError);

      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again later'
      });
    }

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later'
    });
  }
};

/**
 * Verify OTP code
 * POST /api/v1/otp/verify
 */
const verifyOTPCode = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phoneNumber, otpCode } = req.body;

    // Find the most recent unused OTP for this phone number
    const otpRecord = await OTP.findOne({
      where: {
        phoneNumber,
        isUsed: false
      },
      order: [['createdAt', 'DESC']]
    });

    // Check if OTP exists
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one'
      });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await otpRecord.destroy(); // Clean up expired OTP
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one'
      });
    }

    // Check attempts limit (prevent brute force)
    if (otpRecord.attempts >= 5) {
      await otpRecord.destroy();
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP'
      });
    }

    // Verify OTP code
    if (otpRecord.otpCode !== otpCode) {
      // Increment failed attempts
      await otpRecord.update({
        attempts: otpRecord.attempts + 1
      });

      const remainingAttempts = 5 - (otpRecord.attempts + 1);

      return res.status(400).json({
        success: false,
        message: `Invalid OTP code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining`
      });
    }

    // OTP is valid! Mark as used
    await otpRecord.update({ isUsed: true });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        phoneNumber,
        verified: true
      }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later'
    });
  }
};

/**
 * Resend OTP code
 * POST /api/v1/otp/resend
 */
const resendOTPCode = async (req, res) => {
  // Use the same logic as sendOTPCode
  return sendOTPCode(req, res);
};

module.exports = {
  sendOTPCode,
  verifyOTPCode,
  resendOTPCode
};
