import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      email,
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

    const supabase = createAdminClient();

    // Generate a unique email if not provided (phone-based)
    const normalizedPhone = phone.trim().replace(/\D/g, '');
    const normalizedEmail = email?.trim() || `${normalizedPhone}@kisanvyapar.in`;
    const userPassword = password.trim();

    // --- Step 1: Create/get the Supabase Auth user ---
    // This creates an entry in auth.users, which is required by the profiles FK
    let authUserId: string;

    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: userPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName.trim(),
        phone: phone.trim(),
        role,
        district: district || 'Meerut',
        state: state || 'Uttar Pradesh',
      },
    });

    if (signUpError) {
      // If user already exists (duplicate email/phone), update password and re-use
      if (signUpError.message?.includes('already') || signUpError.message?.includes('exists')) {
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers?.users?.find((u) => u.email === normalizedEmail || u.phone === phone.trim());
        if (existing) {
          authUserId = existing.id;
          // Update password for existing user
          await supabase.auth.admin.updateUserById(authUserId, {
            password: userPassword,
            user_metadata: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              role,
            }
          });
        } else {
          return NextResponse.json(
            { error: `Auth user error: ${signUpError.message}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Registration error: ${signUpError.message}` },
          { status: 500 }
        );
      }
    } else {
      authUserId = signUpData.user!.id;
    }

    // --- Step 2: Upsert into the profiles table ---
    const profilePayload = {
      id: authUserId,
      email: normalizedEmail,
      full_name: fullName.trim(),
      phone: phone.trim(),
      role: role as 'farmer' | 'buyer' | 'admin',
      district: district?.trim() || (role === 'farmer' ? 'Sehore' : 'Delhi NCR'),
      state: state?.trim() || (role === 'farmer' ? 'Madhya Pradesh' : 'Delhi'),
      pincode: pincode?.trim() || '466001',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}`,
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      return NextResponse.json(
        { error: `Profile save failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    // --- Step 3: Upsert into farmer_profiles if role is farmer ---
    let farmerProfileData: { farm_name: string; farm_description?: string; crops_grown?: string[]; is_verified: boolean } | null = null;

    if (role === 'farmer') {
      const resolvedFarmName = farmName?.trim() || `${fullName.trim()}'s Krishi Farm`;
      const resolvedCrops = cropsGrown || ['Wheat', 'Paddy', 'Soybean'];

      farmerProfileData = {
        farm_name: resolvedFarmName,
        farm_description: 'Registered certified agricultural grower on Kisan Vyapar Portal',
        crops_grown: resolvedCrops,
        is_verified: true,
      };

      const { error: farmerError } = await supabase
        .from('farmer_profiles')
        .upsert(
          {
            user_id: authUserId,
            farm_name: resolvedFarmName,
            farm_description: farmerProfileData.farm_description,
            crops_grown: resolvedCrops,
            is_verified: true,
          },
          { onConflict: 'user_id' }
        );

      if (farmerError) {
        console.warn('Farmer profile upsert warning:', farmerError.message);
        // Non-fatal: farmer profile insertion failed but auth user + profile are saved
      }
    }

    console.log(`✅ [KVP Register] ${role} '${fullName}' (ID: ${authUserId}) saved to Supabase.`);

    return NextResponse.json({
      success: true,
      message: `${role === 'farmer' ? 'Farmer Producer' : 'Buyer'} account authenticated & registered in database!`,
      user: {
        id: authUserId,
        email: normalizedEmail,
        full_name: fullName.trim(),
        phone: phone.trim(),
        role,
        district: profilePayload.district,
        state: profilePayload.state,
        pincode: profilePayload.pincode,
        avatar_url: profilePayload.avatar_url,
        created_at: new Date().toISOString(),
        farmer_profile: farmerProfileData,
      },
    });
  } catch (err: any) {
    console.error('[KVP Register Error]', err);
    return NextResponse.json(
      { error: err.message || 'Authentication processing error' },
      { status: 500 }
    );
  }
}
