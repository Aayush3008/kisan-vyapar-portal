/**
 * SMS Delivery Service for Kisan Vyapar Portal
 * Supports Fast2SMS (primary for Indian mobile numbers) and Twilio (optional fallback)
 */

export interface SendSMSResult {
  sent: boolean;
  provider: 'fast2sms' | 'twilio' | 'none';
  message: string;
  details?: any;
}

/**
 * Check if a real SMS gateway is configured in environment variables.
 */
export function isSMSGatewayConfigured(): boolean {
  const fast2smsKey = process.env.FAST2SMS_API_KEY?.trim() || '';
  if (
    fast2smsKey &&
    !fast2smsKey.includes('your_') &&
    !fast2smsKey.includes('placeholder')
  ) {
    return true;
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim() || '';
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN?.trim() || '';
  if (
    twilioSid &&
    twilioAuth &&
    !twilioSid.includes('your_') &&
    !twilioSid.includes('placeholder')
  ) {
    return true;
  }

  return false;
}

/**
 * Sends a real 6-digit OTP to an Indian mobile number via Fast2SMS (or Twilio).
 * 
 * @param phone 10-digit Indian phone number (e.g. "9876543210")
 * @param otp 6-digit numerical OTP string (e.g. "568835")
 */
export async function sendMobileOTP(phone: string, otp: string): Promise<SendSMSResult> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  if (cleanPhone.length !== 10) {
    return {
      sent: false,
      provider: 'none',
      message: 'Invalid phone number format. 10 digits required.',
    };
  }

  const fast2smsKey = process.env.FAST2SMS_API_KEY?.trim() || '';

  // 1. Primary: Fast2SMS (Direct Indian Route OTP, no DLT required)
  if (
    fast2smsKey &&
    !fast2smsKey.includes('your_') &&
    !fast2smsKey.includes('placeholder')
  ) {
    try {
      console.log(`📡 [SMS Service] Dispatching OTP via Fast2SMS to +91 ${cleanPhone}...`);

      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2smsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: cleanPhone,
        }),
      });

      const data = await response.json();
      console.log('📡 [Fast2SMS Response]:', data);

      if (data && data.return === true) {
        return {
          sent: true,
          provider: 'fast2sms',
          message: `SMS delivered to +91 ${cleanPhone} via Fast2SMS.`,
          details: data,
        };
      } else {
        const errMsg = Array.isArray(data?.message)
          ? data.message.join(', ')
          : (data?.message || 'Failed to send SMS via Fast2SMS.');
        console.warn('⚠️ [Fast2SMS Gateway Error]:', errMsg);
        return {
          sent: false,
          provider: 'fast2sms',
          message: errMsg,
          details: data,
        };
      }
    } catch (err: any) {
      console.error('❌ [Fast2SMS Network Error]:', err);
      return {
        sent: false,
        provider: 'fast2sms',
        message: err.message || 'Network error connecting to Fast2SMS gateway.',
      };
    }
  }

  // 2. Secondary: Twilio (if configured)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim() || '';
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN?.trim() || '';
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER?.trim() || '';

  if (
    twilioSid &&
    twilioAuth &&
    twilioFrom &&
    !twilioSid.includes('your_')
  ) {
    try {
      const e164Phone = `+91${cleanPhone}`;
      console.log(`📡 [SMS Service] Dispatching OTP via Twilio to ${e164Phone}...`);

      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const bodyParams = new URLSearchParams({
        To: e164Phone,
        From: twilioFrom,
        Body: `Your Kisan Vyapar Portal verification code is: ${otp}. Valid for 5 minutes. Do not share this OTP.`,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      const data = await response.json();
      if (response.ok && !data.error_code) {
        return {
          sent: true,
          provider: 'twilio',
          message: `SMS sent via Twilio to ${e164Phone}.`,
          details: data,
        };
      } else {
        return {
          sent: false,
          provider: 'twilio',
          message: data.message || 'Twilio SMS failed.',
          details: data,
        };
      }
    } catch (err: any) {
      console.error('❌ [Twilio Network Error]:', err);
      return {
        sent: false,
        provider: 'twilio',
        message: err.message || 'Network error connecting to Twilio.',
      };
    }
  }

  // Gateway not configured
  return {
    sent: false,
    provider: 'none',
    message: 'FAST2SMS_API_KEY is not configured in .env.local',
  };
}
