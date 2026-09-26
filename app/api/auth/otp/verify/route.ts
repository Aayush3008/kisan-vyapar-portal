import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/local-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone?.trim() || !otp?.trim()) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required.' },
        { status: 400 }
      );
    }

    const result = verifyOTP(phone, otp);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.message, verified: false },
        { status: 400 }
      );
    }

    console.log(`✅ [KVP OTP] Verified OTP for phone ${phone.trim()}`);

    return NextResponse.json({
      success: true,
      verified: true,
      message: result.message,
    });
  } catch (err: any) {
    console.error('[KVP OTP Verify Error]', err);
    return NextResponse.json(
      { error: err.message || 'OTP verification failed.' },
      { status: 500 }
    );
  }
}
