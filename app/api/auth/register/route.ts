import { NextResponse } from 'next/server';
import { createUser } from '@/lib/local-db';

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

    // Create user in local JSON database
    const newUser = createUser({
      fullName,
      phone,
      password,
      role,
      district,
      state,
      pincode,
      farmName,
      cropsGrown,
    });

    console.log(`✅ [KVP Register] ${role} '${fullName}' (ID: ${newUser.id}) saved to local database.`);

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
