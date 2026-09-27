import { NextResponse } from 'next/server';
import { getSupabaseAdminSafe } from '@/lib/supabase/db';
import { getCanonicalPhone, saveUser, getAllUsers, findUser } from '@/lib/local-db';
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

    const rawDigits = phone.trim().replace(/\D/g, '');
    const canonicalPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

    if (canonicalPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    const email = `${canonicalPhone}@kisanvyapar.in`;
    const supabase = getSupabaseAdminSafe();

    // Check all possible existing formats
    const phoneVariants = [
      canonicalPhone,
      `91${canonicalPhone}`,
      `+91${canonicalPhone}`,
      `+91 ${canonicalPhone}`,
      `0${canonicalPhone}`,
      rawDigits,
    ];

    let existingInSupabase: any = null;

    if (supabase) {
      try {
        const { data } = await supabase
          .from('app_users')
          .select('id, full_name, phone')
          .in('phone', phoneVariants);

        if (data && data.length > 0) {
          existingInSupabase = data[0];
        } else {
          // Wildcard check
          const { data: wildcard } = await supabase
            .from('app_users')
            .select('id, full_name, phone')
            .ilike('phone', `%${canonicalPhone}%`);

          if (wildcard && wildcard.length > 0) {
            existingInSupabase = wildcard[0];
          }
        }
      } catch (checkErr) {
        console.warn('[KVP Register] Error checking existing user in Supabase:', checkErr);
      }
    }

    // Check local database for existing user
    const existingInLocal = findUser(canonicalPhone) || getAllUsers().find(u => getCanonicalPhone(u.phone) === canonicalPhone);

    if (existingInSupabase || existingInLocal) {
      return NextResponse.json(
        { 
          error: 'An account with this mobile number is already registered. Please switch to the "Sign In to Portal" tab and enter your password.',
          alreadyRegistered: true,
        },
        { status: 409 }
      );
    }

    // Build user record
    const now = new Date().toISOString();
    const userId = crypto.randomUUID();
    const userRecord: Record<string, any> = {
      id: userId,
      email,
      full_name: fullName.trim(),
      phone: canonicalPhone,
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

    let savedUser = userRecord;

    // 1. Try to insert into Supabase
    if (supabase) {
      try {
        const { data: newUser, error: insertError } = await supabase
          .from('app_users')
          .insert(userRecord)
          .select()
          .single();

        if (!insertError && newUser) {
          savedUser = newUser;
          console.log(`✅ [KVP Register] ${role} '${fullName}' (ID: ${newUser.id}) saved to app_users.`);

          // Dual-sync to profiles & farmer_profiles if tables exist
          try {
            await supabase.from('profiles').upsert({
              id: newUser.id,
              email: newUser.email,
              full_name: newUser.full_name,
              phone: canonicalPhone,
              role: newUser.role,
              avatar_url: newUser.avatar_url,
              district: newUser.district,
              state: newUser.state,
              pincode: newUser.pincode,
              created_at: newUser.created_at,
            }, { onConflict: 'id' });

            if (role === 'farmer') {
              await supabase.from('farmer_profiles').upsert({
                user_id: newUser.id,
                farm_name: userRecord.farm_name,
                farm_description: userRecord.farm_description,
                crops_grown: userRecord.crops_grown,
                is_verified: true,
              }, { onConflict: 'user_id' });
            }
            console.log(`✅ [KVP Register] User synced to profiles table.`);
          } catch (profileErr) {
            console.warn('[KVP Register] profiles sync skipped:', profileErr);
          }
        } else if (insertError) {
          console.warn('[KVP Register] Supabase insert warning:', insertError.message);
        }
      } catch (sbErr) {
        console.warn('[KVP Register] Supabase insertion error:', sbErr);
      }
    }

    // 2. Always persist to local database for instant offline/cold-start fallback
    try {
      saveUser({
        id: savedUser.id,
        email: savedUser.email,
        full_name: savedUser.full_name,
        phone: canonicalPhone,
        password_hash: savedUser.password_hash,
        role: savedUser.role,
        district: savedUser.district,
        state: savedUser.state,
        pincode: savedUser.pincode,
        avatar_url: savedUser.avatar_url,
        farm_name: savedUser.farm_name,
        farm_description: savedUser.farm_description,
        crops_grown: savedUser.crops_grown,
        is_verified: savedUser.is_verified,
        created_at: savedUser.created_at,
        updated_at: savedUser.updated_at,
      });
      console.log(`✅ [KVP Register] User saved to local JSON storage.`);
    } catch (localErr) {
      console.warn('[KVP Register] Local storage write warning:', localErr);
    }

    return NextResponse.json({
      success: true,
      message: `${role === 'farmer' ? 'Farmer Producer' : 'Buyer'} account registered successfully!`,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        full_name: savedUser.full_name,
        phone: canonicalPhone,
        role: savedUser.role,
        district: savedUser.district,
        state: savedUser.state,
        pincode: savedUser.pincode,
        avatar_url: savedUser.avatar_url,
        created_at: savedUser.created_at,
        farmer_profile: savedUser.role === 'farmer'
          ? {
              farm_name: savedUser.farm_name,
              farm_description: savedUser.farm_description,
              crops_grown: savedUser.crops_grown,
              is_verified: savedUser.is_verified,
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
