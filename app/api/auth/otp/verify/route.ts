import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/db';

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

    const supabase = getSupabaseAdmin();
    const normalizedPhone = phone.trim().replace(/\D/g, '');

    // Fetch stored OTP from Supabase
    const { data: entry, error: fetchError } = await supabase
      .from('app_otps')
      .select('*')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (fetchError) {
      console.error('[KVP OTP Verify] Supabase fetch error:', fetchError);
      return NextResponse.json(
        { error: 'OTP verification failed. Database error.' },
        { status: 500 }
      );
    }

    if (!entry) {
      return NextResponse.json(
        { error: 'No OTP was sent to this number. Please request a new OTP.', verified: false },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > new Date(entry.expires_at)) {
      // Delete expired OTP
      await supabase.from('app_otps').delete().eq('phone', normalizedPhone);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.', verified: false },
        { status: 400 }
      );
    }

    // Check OTP value
    if (entry.otp !== otp.trim()) {
      return NextResponse.json(
        { error: 'Incorrect OTP entered. Please check and try again.', verified: false },
        { status: 400 }
      );
    }

    // OTP is valid — delete it so it can't be reused
    await supabase.from('app_otps').delete().eq('phone', normalizedPhone);

    console.log(`✅ [KVP OTP] Verified OTP for phone ${normalizedPhone} (via Supabase)`);

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
