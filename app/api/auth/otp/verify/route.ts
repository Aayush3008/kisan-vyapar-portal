import { NextResponse } from 'next/server';
import { getSupabaseAdminSafe } from '@/lib/supabase/db';
import { getCanonicalPhone, verifyOTP } from '@/lib/local-db';

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

    const rawDigits = phone.trim().replace(/\D/g, '');
    const canonicalPhone = getCanonicalPhone(rawDigits);
    const trimmedOtp = otp.trim();

    let verified = false;

    // 1. Try Supabase verification if configured
    const supabase = getSupabaseAdminSafe();
    if (supabase) {
      try {
        const { data: entries } = await supabase
          .from('app_otps')
          .select('*')
          .in('phone', [canonicalPhone, rawDigits, `91${canonicalPhone}`]);

        if (entries && entries.length > 0) {
          const entry = entries[0];
          // Check expiration
          if (new Date() <= new Date(entry.expires_at) && entry.otp === trimmedOtp) {
            verified = true;
            // Clean up verified OTP
            await supabase.from('app_otps').delete().eq('phone', entry.phone);
          }
        }
      } catch (sbErr) {
        console.warn('[KVP OTP Verify] Supabase check warning:', sbErr);
      }
    }

    // 2. Fallback to local store verification
    if (!verified) {
      const localResult = verifyOTP(canonicalPhone, trimmedOtp);
      if (localResult.valid) {
        verified = true;
      } else if (!supabase) {
        return NextResponse.json(
          { error: localResult.message, verified: false },
          { status: 400 }
        );
      }
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'Incorrect or expired OTP entered. Please check and try again.', verified: false },
        { status: 400 }
      );
    }

    console.log(`✅ [KVP OTP] Verified OTP for phone ${canonicalPhone}`);

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'OTP verified successfully!',
    });
  } catch (err: any) {
    console.error('[KVP OTP Verify Error]', err);
    return NextResponse.json(
      { error: err.message || 'OTP verification failed.' },
      { status: 500 }
    );
  }
}
