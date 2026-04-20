/**
 * TODO: OTP Routes - Currently inactive until SMS service is configured
 *
 * These routes will work once you:
 * 1. Get SMS API credentials from your provider (Twilio, Nexmo, etc.)
 * 2. Update .env with SMS_PROVIDER, SMS_API_KEY, SMS_API_SECRET, SMS_FROM_NUMBER
 * 3. Uncomment OTP verification in authController.js
 *
 * For now, users can register directly with phone + password
 */

const express = require('express');
const router = express.Router();
const { sendOTPCode, verifyOTPCode, resendOTPCode } = require('../controllers/otpController');
const { sendOTPValidation, verifyOTPValidation } = require('../validators/otpValidator');

// Send OTP to phone number
router.post('/send', sendOTPValidation, sendOTPCode);

// Verify OTP code
router.post('/verify', verifyOTPValidation, verifyOTPCode);

// Resend OTP (same as send, but semantically different endpoint)
router.post('/resend', sendOTPValidation, resendOTPCode);

module.exports = router;
