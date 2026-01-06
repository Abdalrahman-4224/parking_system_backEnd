const crypto = require('crypto');

/**
 * SMS Service for sending OTP codes
 *
 * SETUP INSTRUCTIONS:
 * 1. Get your SMS provider API credentials (Twilio, Nexmo, etc.)
 * 2. Add them to your .env file:
 *    SMS_PROVIDER=twilio (or nexmo, aws-sns, etc.)
 *    SMS_API_KEY=your_api_key_here
 *    SMS_API_SECRET=your_api_secret_here
 *    SMS_FROM_NUMBER=your_sender_phone_number
 * 3. Uncomment and configure the provider section below
 */

// Placeholder for SMS provider configuration
// Uncomment and configure based on your provider when you get the API keys

/* ===== TWILIO EXAMPLE ===== */
// const twilio = require('twilio');
// const twilioClient = twilio(
//   process.env.SMS_API_KEY,      // Account SID
//   process.env.SMS_API_SECRET    // Auth Token
// );

/* ===== NEXMO/VONAGE EXAMPLE ===== */
// const Nexmo = require('nexmo');
// const nexmo = new Nexmo({
//   apiKey: process.env.SMS_API_KEY,
//   apiSecret: process.env.SMS_API_SECRET
// });

/* ===== AWS SNS EXAMPLE ===== */
// const AWS = require('aws-sdk');
// AWS.config.update({
//   accessKeyId: process.env.SMS_API_KEY,
//   secretAccessKey: process.env.SMS_API_SECRET,
//   region: process.env.AWS_REGION || 'us-east-1'
// });
// const sns = new AWS.SNS();

/**
 * Generate a secure random OTP code
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Random numeric OTP
 */
function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }

  return otp;
}

/**
 * Send OTP via SMS
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} otpCode - OTP code to send
 * @returns {Promise<Object>} - Result of SMS send operation
 */
async function sendOTP(phoneNumber, otpCode) {
  const message = `Your parking system verification code is: ${otpCode}. Valid for 5 minutes. Do not share this code.`;

  try {
    // ===== DEVELOPMENT MODE: Just log to console =====
    if (process.env.NODE_ENV === 'development' && !process.env.SMS_API_KEY) {
      console.log('\n' + '='.repeat(50));
      console.log('📱 SMS SERVICE - DEVELOPMENT MODE');
      console.log('='.repeat(50));
      console.log(`To: ${phoneNumber}`);
      console.log(`Message: ${message}`);
      console.log(`OTP Code: ${otpCode}`);
      console.log('='.repeat(50) + '\n');

      return {
        success: true,
        messageId: 'dev-' + Date.now(),
        provider: 'console',
        message: 'OTP logged to console (development mode)'
      };
    }

    // ===== PRODUCTION MODE: Choose your SMS provider =====

    /* ----- TWILIO IMPLEMENTATION ----- */
    // const result = await twilioClient.messages.create({
    //   body: message,
    //   from: process.env.SMS_FROM_NUMBER,
    //   to: phoneNumber
    // });
    //
    // return {
    //   success: true,
    //   messageId: result.sid,
    //   provider: 'twilio'
    // };

    /* ----- NEXMO/VONAGE IMPLEMENTATION ----- */
    // return new Promise((resolve, reject) => {
    //   nexmo.message.sendSms(
    //     process.env.SMS_FROM_NUMBER,
    //     phoneNumber,
    //     message,
    //     (err, responseData) => {
    //       if (err) {
    //         reject(err);
    //       } else {
    //         if (responseData.messages[0].status === '0') {
    //           resolve({
    //             success: true,
    //             messageId: responseData.messages[0]['message-id'],
    //             provider: 'nexmo'
    //           });
    //         } else {
    //           reject(new Error(responseData.messages[0]['error-text']));
    //         }
    //       }
    //     }
    //   );
    // });

    /* ----- AWS SNS IMPLEMENTATION ----- */
    // const params = {
    //   Message: message,
    //   PhoneNumber: phoneNumber,
    //   MessageAttributes: {
    //     'AWS.SNS.SMS.SMSType': {
    //       DataType: 'String',
    //       StringValue: 'Transactional'
    //     }
    //   }
    // };
    //
    // const result = await sns.publish(params).promise();
    //
    // return {
    //   success: true,
    //   messageId: result.MessageId,
    //   provider: 'aws-sns'
    // };

    // If no provider is configured in production, throw error
    throw new Error('SMS provider not configured. Please add SMS API credentials to .env file');

  } catch (error) {
    console.error('SMS Send Error:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

/**
 * Calculate OTP expiration time
 * @param {number} minutes - Minutes until expiration (default: 5)
 * @returns {Date} - Expiration date
 */
function getOTPExpiration(minutes = 5) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - True if valid
 */
function isValidPhoneNumber(phoneNumber) {
  // International format validation
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phoneNumber);
}

module.exports = {
  generateOTP,
  sendOTP,
  getOTPExpiration,
  isValidPhoneNumber
};
