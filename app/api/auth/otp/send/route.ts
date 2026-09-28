import { NextResponse } from 'next/server';
import { getSupabaseAdminSafe } from '@/lib/supabase/db';
import { getCanonicalPhone, generateOTP } from '@/lib/local-db';
import { sendMobileOTP } from '@/lib/sms';

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

    const rawDigits = phone.trim().replace(/\D/g, '');
    const canonicalPhone = getCanonicalPhone(rawDigits);

    if (canonicalPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    // Always generate and persist to local store first (never fails)
    const otp = generateOTP(canonicalPhone);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Try to sync OTP to Supabase if configured
    const supabase = getSupabaseAdminSafe();
    if (supabase) {
      try {
        await supabase
          .from('app_otps')
          .upsert(
            {
              phone: canonicalPhone,
              otp,
              expires_at: expiresAt,
              created_at: new Date().toISOString(),
            },
            { onConflict: 'phone' }
          );
      } catch (sbErr) {
        console.warn('[KVP OTP Send] Supabase OTP upsert warning:', sbErr);
      }
    }

    console.log(`📱 [KVP OTP] Generated OTP ${otp} for phone +91 ${canonicalPhone}`);

    // Dispatch real SMS to the mobile phone
    const smsResult = await sendMobileOTP(canonicalPhone, otp);

    if (smsResult.sent) {
      console.log(`✅ [KVP OTP] Real SMS sent to +91 ${canonicalPhone} via ${smsResult.provider}`);
      return NextResponse.json({
        success: true,
        real_sms: true,
        provider: smsResult.provider,
        message: `OTP sent to +91 ${canonicalPhone} via SMS! Check your mobile messages.`,
      });
    }

    // If SMS gateway is not configured or sending failed, provide demo fallback
    console.log(`ℹ️ [KVP OTP] SMS gateway not active (${smsResult.message}). Providing demo mode hint.`);
    return NextResponse.json({
      success: true,
      real_sms: false,
      message: `OTP sent for ${phone.trim()}. (Demo Mode)`,
      otp_hint: otp,
      sms_warning: smsResult.message,
    });
  } catch (err: any) {
    console.error('[KVP OTP Send Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate OTP.' },
      { status: 500 }
    );
  }
}

