import { NextResponse } from 'next/server';
import { generateOTP } from '@/lib/local-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone?.trim()) {
      return NextResponse.json(
        { error: 'Please provide a valid mobile phone number.' },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim().replace(/\D/g, '');

    if (normalizedPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP(normalizedPhone);

    console.log(`📱 [KVP OTP] Sent OTP ${otp} to phone ${normalizedPhone}`);

    // In a production app, you'd send this via SMS (Twilio, MSG91, etc.)
    // For now, we return it in the response so the UI can show it
    return NextResponse.json({
      success: true,
      message: `OTP sent to ${phone.trim()}. Valid for 5 minutes.`,
      // In production, NEVER return the OTP in the response!
      // We do it here for demo purposes so the user can see it.
      otp_hint: otp,
    });
  } catch (err: any) {
    console.error('[KVP OTP Send Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate OTP.' },
      { status: 500 }
    );
  }
}
