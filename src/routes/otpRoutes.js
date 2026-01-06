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
