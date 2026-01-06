# OTP Setup Guide for Parking System

## Overview
OTP (One-Time Password) has been integrated into the registration process. Users must verify their phone number with an OTP code before completing registration.

---

## How It Works

### Registration Flow (2 Steps):

```
Step 1: Send OTP
User enters phone number → System generates 6-digit code →
SMS sent to user → OTP stored in database

Step 2: Verify OTP
User enters OTP code → System verifies code →
User completes registration with username & password
```

---

## API Endpoints

### 1. Send OTP
**POST** `/api/v1/otp/send`

**Request:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your phone number",
  "data": {
    "phoneNumber": "+1234567890",
    "expiresIn": "5 minutes",
    "otpCode": "482639"  // Only in development mode!
  }
}
```

**Features:**
- Generates random 6-digit code
- Expires in 5 minutes
- Rate limiting: 1 request per minute
- Daily limit: 10 OTPs per phone number
- Deletes old unused OTPs automatically

---

### 2. Verify OTP
**POST** `/api/v1/otp/verify`

**Request:**
```json
{
  "phoneNumber": "+1234567890",
  "otpCode": "482639"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "phoneNumber": "+1234567890",
    "verified": true
  }
}
```

**Features:**
- Validates OTP code
- Maximum 5 verification attempts
- Marks OTP as used after successful verification
- Verification valid for 30 minutes

---

### 3. Resend OTP
**POST** `/api/v1/otp/resend`

Same as `/send` endpoint - generates and sends a new OTP.

---

### 4. Register (Updated)
**POST** `/api/v1/auth/register`

**Request:**
```json
{
  "phoneNumber": "+1234567890",
  "username": "john_doe",
  "password": "password123"
}
```

**Important:**
- Phone number MUST be verified with OTP first!
- OTP verification must be completed within 30 minutes
- System checks for verified OTP before creating account

**Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "username": "john_doe",
      "phoneNumber": "+1234567890",
      "isActive": true
    },
    "token": "jwt-token-here"
  }
}
```

---

## Complete Registration Example

### Step 1: Send OTP
```bash
POST http://localhost:3000/api/v1/otp/send
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}
```

### Step 2: User receives SMS
```
Your parking system verification code is: 482639
Valid for 5 minutes. Do not share this code.
```

### Step 3: Verify OTP
```bash
POST http://localhost:3000/api/v1/otp/verify
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otpCode": "482639"
}
```

### Step 4: Complete Registration
```bash
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "username": "john_doe",
  "password": "password123"
}
```

---

## SMS Provider Setup

### Currently in Development Mode
Since you don't have SMS API credentials yet, the system runs in **development mode**:
- OTP codes are **printed to the console** (server terminal)
- No actual SMS is sent
- Perfect for testing!

**Console Output Example:**
```
==================================================
📱 SMS SERVICE - DEVELOPMENT MODE
==================================================
To: +1234567890
Message: Your parking system verification code is: 482639...
OTP Code: 482639
==================================================
```

---

### Setting Up SMS Provider (When You Get API Keys)

#### Option 1: Twilio (Recommended)
1. Sign up at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Buy a phone number

**Update .env file:**
```env
SMS_PROVIDER=twilio
SMS_API_KEY=your_account_sid_here
SMS_API_SECRET=your_auth_token_here
SMS_FROM_NUMBER=+1234567890
```

**Install Twilio:**
```bash
npm install twilio
```

**Uncomment in smsService.js:**
```javascript
// Line ~13-17 (Twilio client setup)
const twilio = require('twilio');
const twilioClient = twilio(
  process.env.SMS_API_KEY,
  process.env.SMS_API_SECRET
);

// Line ~102-109 (Twilio send implementation)
const result = await twilioClient.messages.create({
  body: message,
  from: process.env.SMS_FROM_NUMBER,
  to: phoneNumber
});

return {
  success: true,
  messageId: result.sid,
  provider: 'twilio'
};
```

#### Option 2: Nexmo/Vonage
```bash
npm install nexmo
```
Uncomment Nexmo section in `smsService.js`

#### Option 3: AWS SNS
```bash
npm install aws-sdk
```
Uncomment AWS SNS section in `smsService.js`

---

## Database Schema

### OTP Table
```sql
CREATE TABLE otps (
  id UUID PRIMARY KEY,
  phoneNumber VARCHAR(20) NOT NULL,
  otpCode VARCHAR(6) NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  isUsed BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  purpose ENUM('registration', 'login', 'reset_password'),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

---

## Security Features

### Rate Limiting
- **1 minute** cooldown between OTP requests
- **10 OTPs maximum** per phone per day
- Prevents spam and abuse

### Attempt Limiting
- Maximum **5 verification attempts** per OTP
- Auto-deletes OTP after max attempts
- Prevents brute force attacks

### Expiration
- OTP expires in **5 minutes**
- Verification window: **30 minutes** after OTP verification
- Auto-cleanup of expired OTPs

### Security Best Practices
- OTP codes are random (crypto.randomInt)
- Codes deleted after successful use
- One-time use only (isUsed flag)
- No OTP code in production API responses

---

## Error Handling

### Common Error Responses

**OTP Not Verified:**
```json
{
  "success": false,
  "message": "Phone number not verified. Please verify your phone number with OTP first"
}
```

**OTP Expired:**
```json
{
  "success": false,
  "message": "OTP has expired. Please request a new one"
}
```

**Invalid OTP Code:**
```json
{
  "success": false,
  "message": "Invalid OTP code. 4 attempts remaining"
}
```

**Rate Limit Exceeded:**
```json
{
  "success": false,
  "message": "Please wait 1 minute before requesting another OTP"
}
```

**Too Many Failed Attempts:**
```json
{
  "success": false,
  "message": "Too many failed attempts. Please request a new OTP"
}
```

---

## Testing

### Manual Testing (Development Mode)

1. Start the server:
```bash
npm run dev
```

2. Send OTP request (use Postman/Thunder Client):
```
POST http://localhost:3000/api/v1/otp/send
Body: {"phoneNumber": "+1234567890"}
```

3. Check server console for OTP code

4. Verify OTP:
```
POST http://localhost:3000/api/v1/otp/verify
Body: {"phoneNumber": "+1234567890", "otpCode": "482639"}
```

5. Register:
```
POST http://localhost:3000/api/v1/auth/register
Body: {
  "phoneNumber": "+1234567890",
  "username": "john_doe",
  "password": "password123"
}
```

---

## Files Created/Modified

### New Files:
- `src/models/OTP.js` - OTP database model
- `src/utils/smsService.js` - SMS sending utility
- `src/validators/otpValidator.js` - Input validation
- `src/controllers/otpController.js` - OTP business logic
- `src/routes/otpRoutes.js` - OTP API routes

### Modified Files:
- `src/controllers/authController.js` - Added OTP verification to registration
- `src/routes/index.js` - Added OTP routes
- `.env` - Added SMS configuration placeholders
- `.env.example` - Added SMS configuration template

---

## Next Steps

1. ✅ OTP system is ready for testing in development mode
2. ⏳ Get SMS provider API credentials (Twilio recommended)
3. ⏳ Update .env file with your API keys
4. ⏳ Install SMS provider package (e.g., `npm install twilio`)
5. ⏳ Uncomment provider code in `smsService.js`
6. ⏳ Test with real phone numbers
7. ⏳ Deploy to production

---

## Costs

### SMS Pricing (Approximate):
- **Twilio:** $0.0075 per SMS (USA)
- **Nexmo:** $0.0090 per SMS (USA)
- **AWS SNS:** $0.00645 per SMS (USA)

### Budget Example:
- 1000 registrations/month = ~$7.50/month (Twilio)
- 10,000 registrations/month = ~$75/month (Twilio)

---

## Support

If you have questions or need help:
1. Check the SMS provider documentation
2. Review `src/utils/smsService.js` for implementation examples
3. Test in development mode first before adding real API keys

---

**Status:** ✅ Ready for development testing
**Next Action:** Get SMS provider API credentials when ready for production
