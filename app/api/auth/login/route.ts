import { NextResponse } from 'next/server';
import { findUser, verifyPassword } from '@/lib/local-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier?.trim() || !password) {
      return NextResponse.json(
        { error: 'Please enter your mobile phone number / email and password.' },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim();

    // Find user in local database
    const userProfile = findUser(trimmedIdentifier);

    if (!userProfile) {
      return NextResponse.json(
        {
          error: 'No account found with this phone number or email. Please Register first to access Kisan Vyapar Portal.',
          notFound: true,
        },
        { status: 404 }
      );
    }

    // Verify password
    if (!verifyPassword(password.trim(), userProfile.password_hash)) {
      return NextResponse.json(
        { error: 'Incorrect password entered. Please check your password and try again.' },
        { status: 401 }
      );
    }

    // Build farmer profile if applicable
    let farmerProfile = null;
    if (userProfile.role === 'farmer') {
      farmerProfile = {
        farm_name: userProfile.farm_name || `${userProfile.full_name}'s Krishi Farm`,
        farm_description: userProfile.farm_description || 'Registered certified agricultural grower',
        crops_grown: userProfile.crops_grown || ['Wheat', 'Paddy', 'Sugarcane'],
        is_verified: userProfile.is_verified ?? true,
      };
    }

    console.log(`✅ [KVP Login] Authenticated user ${userProfile.full_name} (${userProfile.role})`);

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${userProfile.full_name}! Credentials verified successfully.`,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        phone: userProfile.phone,
        role: userProfile.role,
        district: userProfile.district || 'Meerut',
        state: userProfile.state || 'Uttar Pradesh',
        pincode: userProfile.pincode || '250002',
        avatar_url: userProfile.avatar_url,
        farmer_profile: farmerProfile,
      },
    });
  } catch (err: any) {
    console.error('[KVP Login Error]', err);
    return NextResponse.json(
      { error: err.message || 'Authentication failed due to server error.' },
      { status: 500 }
    );
  }
}
