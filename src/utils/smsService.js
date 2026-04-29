const crypto = require('crypto');
const twilio = require('twilio');

function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
}

async function sendOTP(phoneNumber, otpCode) {
  try {
    if (process.env.NODE_ENV === 'development' && !process.env.TWILIO_ACCOUNT_SID) {
      console.log(`[DEV] WhatsApp OTP to ${phoneNumber}: ${otpCode}`);
      return { success: true, messageId: 'dev-' + Date.now(), provider: 'console' };
    }

    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      body: `*${otpCode}* is your verification code. For your security, do not share this code.`,
      to: `whatsapp:${phoneNumber}`
    });

    return { success: true, messageId: result.sid, provider: 'twilio-whatsapp' };

  } catch (error) {
    console.error('WhatsApp Send Error:', error);
    throw new Error(`Failed to send WhatsApp OTP: ${error.message}`);
  }
}

function getOTPExpiration(minutes = 5) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function isValidPhoneNumber(phoneNumber) {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phoneNumber);
}

module.exports = {
  generateOTP,
  sendOTP,
  getOTPExpiration,
  isValidPhoneNumber
};
