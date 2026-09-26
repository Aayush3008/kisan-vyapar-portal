import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/db';
import crypto from 'crypto';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      password,
      role = 'buyer',
      district,
      state,
      pincode,
      farmName,
      cropsGrown,
    } = body;

    if (!fullName?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: 'Full name and mobile phone number are required for registration.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: 'Please choose a secure password with at least 4 characters.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const normalizedPhone = phone.trim().replace(/\D/g, '');
    const email = `${normalizedPhone}@kisanvyapar.in`;

    // Check if user with this phone already exists
    const { data: existing } = await supabase
      .from('app_users')
      .select('id')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this mobile number is already registered. Please Sign In instead.' },
        { status: 409 }
      );
    }

    // Build user record
    const now = new Date().toISOString();
    const userRecord: Record<string, any> = {
      email,
      full_name: fullName.trim(),
      phone: normalizedPhone,
      password_hash: hashPassword(password),
      role,
      district: district?.trim() || 'Meerut',
      state: state?.trim() || 'Uttar Pradesh',
      pincode: pincode?.trim() || '250002',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}`,
      created_at: now,
      updated_at: now,
    };

    if (role === 'farmer') {
      userRecord.farm_name = farmName?.trim() || `${fullName.trim()}'s Krishi Farm`;
      userRecord.farm_description = 'Registered certified agricultural grower on Kisan Vyapar Portal';
      userRecord.crops_grown = cropsGrown || ['Wheat', 'Paddy', 'Soybean'];
      userRecord.is_verified = true;
    }

    // Insert into Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('app_users')
      .insert(userRecord)
      .select()
      .single();

    if (insertError) {
      console.error('[KVP Register] Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Registration failed. Database error: ' + insertError.message },
        { status: 500 }
      );
    }

    console.log(`✅ [KVP Register] ${role} '${fullName}' (ID: ${newUser.id}) saved to Supabase.`);

    return NextResponse.json({
      success: true,
      message: `${role === 'farmer' ? 'Farmer Producer' : 'Buyer'} account registered successfully!`,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        phone: newUser.phone,
        role: newUser.role,
        district: newUser.district,
        state: newUser.state,
        pincode: newUser.pincode,
        avatar_url: newUser.avatar_url,
        created_at: newUser.created_at,
        farmer_profile: newUser.role === 'farmer'
          ? {
              farm_name: newUser.farm_name,
              farm_description: newUser.farm_description,
              crops_grown: newUser.crops_grown,
              is_verified: newUser.is_verified,
            }
          : null,
      },
    });
  } catch (err: any) {
    console.error('[KVP Register Error]', err);
    return NextResponse.json(
      { error: err.message || 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
