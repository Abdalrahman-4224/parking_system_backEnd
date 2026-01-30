const { User } = require('../models');
// TODO: Uncomment when OTP service is ready
// const OTP = require('../models/OTP');
const { generateToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { username, phoneNumber, password } = req.body;

    // TODO: OTP VERIFICATION - Uncomment this block when SMS OTP service is ready
    // ========================================================================
    // Step 1: Verify OTP first
    // const otpRecord = await OTP.findOne({
    //   where: {
    //     phoneNumber,
    //     isUsed: true // OTP must be verified (marked as used)
    //   },
    //   order: [['createdAt', 'DESC']]
    // });
    //
    // if (!otpRecord) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Phone number not verified. Please verify your phone number with OTP first'
    //   });
    // }
    //
    // // Check if OTP verification is still valid (within 30 minutes)
    // const otpAge = Date.now() - new Date(otpRecord.updatedAt).getTime();
    // const maxOTPAge = 30 * 60 * 1000; // 30 minutes
    //
    // if (otpAge > maxOTPAge) {
    //   await otpRecord.destroy();
    //   return res.status(400).json({
    //     success: false,
    //     message: 'OTP verification expired. Please verify your phone number again'
    //   });
    // }
    // ========================================================================

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        phoneNumber
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    // Create user account
    const user = await User.create({
      username,
      phoneNumber,
      password
    });

    // TODO: OTP CLEANUP - Uncomment when OTP service is ready
    // await otpRecord.destroy();

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await User.findOne({
      where: { phoneNumber }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const token = generateToken({
      id: user.id,
      username: user.username
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};
