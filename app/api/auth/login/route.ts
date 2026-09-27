import { NextResponse } from 'next/server';
import { getSupabaseAdminSafe } from '@/lib/supabase/db';
import { findUser, getAllUsers, getCanonicalPhone, saveUser } from '@/lib/local-db';
import crypto from 'crypto';

function verifyPassword(password: string, storedHash?: string | null): boolean {
  if (!storedHash) return false;
  const trimmedPass = password.trim();
  const trimmedStored = storedHash.trim();

  // 1. Direct text match (for manual DB seeds or dev accounts)
  if (trimmedPass === trimmedStored) return true;

  // 2. Salted sha256 (standard format: salt:hash)
  if (trimmedStored.includes(':')) {
    const [salt, hash] = trimmedStored.split(':');
    if (salt && hash) {
      const candidate = crypto.createHash('sha256').update(salt + trimmedPass).digest('hex');
      if (candidate === hash) return true;
    }
  }

  // 3. Unsalted sha256
  const candidateUnsalted = crypto.createHash('sha256').update(trimmedPass).digest('hex');
  if (candidateUnsalted === trimmedStored) return true;

  return false;
}

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

    const rawIdentifier = identifier.trim();
    const digitsOnly = rawIdentifier.replace(/\D/g, '');
    const canonical = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : '';

    // Collect all plausible variants of the phone number
    const phoneVariants: string[] = [];
    if (canonical) {
      phoneVariants.push(
        canonical, // '8791100317'
        `91${canonical}`, // '918791100317'
        `+91${canonical}`, // '+918791100317'
        `+91 ${canonical}`, // '+91 8791100317'
        `+91 ${canonical.slice(0, 5)} ${canonical.slice(5)}`, // '+91 87911 00317'
        `0${canonical}`, // '08791100317'
        digitsOnly,
        rawIdentifier
      );
    } else if (digitsOnly) {
      phoneVariants.push(digitsOnly, rawIdentifier);
    }

    // Collect all plausible variants of the email
    const emailVariants: string[] = [rawIdentifier.toLowerCase()];
    if (canonical) {
      emailVariants.push(
        `${canonical}@kisanvyapar.in`,
        `91${canonical}@kisanvyapar.in`
      );
    }

    let userProfile: any = null;
    const supabase = getSupabaseAdminSafe();

    // ─────────────────────────────────────────────────────────────
    // 1. QUERY SUPABASE (if configured)
    // ─────────────────────────────────────────────────────────────
    if (supabase) {
      try {
        // Query app_users by phone variants
        // NOTE: Use select('*') instead of maybeSingle() to prevent PGRST116 crashes
        // if user was registered multiple times.
        if (phoneVariants.length > 0) {
          const { data: phoneMatches, error: phoneErr } = await supabase
            .from('app_users')
            .select('*')
            .in('phone', phoneVariants);

          if (!phoneErr && phoneMatches && phoneMatches.length > 0) {
            // Sort by updated_at / created_at descending to take latest
            userProfile = phoneMatches.sort(
              (a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()
            )[0];
          }

          // If still not found, try wildcard match on last 10 digits
          if (!userProfile && canonical) {
            const { data: wildcardMatches } = await supabase
              .from('app_users')
              .select('*')
              .ilike('phone', `%${canonical}%`);

            if (wildcardMatches && wildcardMatches.length > 0) {
              userProfile = wildcardMatches.sort(
                (a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()
              )[0];
            }
          }
        }

        // If not found by phone, query app_users by email variants
        if (!userProfile) {
          const { data: emailMatches } = await supabase
            .from('app_users')
            .select('*')
            .in('email', emailVariants);

          if (emailMatches && emailMatches.length > 0) {
            userProfile = emailMatches.sort(
              (a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()
            )[0];
          }
        }

        // If not found in app_users, check profiles table
        if (!userProfile) {
          if (phoneVariants.length > 0) {
            const { data: profilePhoneMatches } = await supabase
              .from('profiles')
              .select('*')
              .in('phone', phoneVariants);

            if (profilePhoneMatches && profilePhoneMatches.length > 0) {
              const p = profilePhoneMatches[0];
              // Try to find matching app_users entry by ID
              const { data: matchingAppUser } = await supabase
                .from('app_users')
                .select('*')
                .eq('id', p.id)
                .maybeSingle();

              userProfile = matchingAppUser || p;
            }
          }

          if (!userProfile) {
            const { data: profileEmailMatches } = await supabase
              .from('profiles')
              .select('*')
              .in('email', emailVariants);

            if (profileEmailMatches && profileEmailMatches.length > 0) {
              const p = profileEmailMatches[0];
              const { data: matchingAppUser } = await supabase
                .from('app_users')
                .select('*')
                .eq('id', p.id)
                .maybeSingle();

              userProfile = matchingAppUser || p;
            }
          }
        }
      } catch (dbErr) {
        console.warn('[KVP Login] Supabase query error, falling back to local store:', dbErr);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. FALLBACK TO LOCAL DATABASE (users.json)
    // ─────────────────────────────────────────────────────────────
    if (!userProfile) {
      const localMatch = findUser(rawIdentifier);
      if (localMatch) {
        userProfile = localMatch;
      } else if (canonical) {
        const allLocal = getAllUsers();
        userProfile = allLocal.find((u) => {
          const uC = getCanonicalPhone(u.phone);
          return uC && uC === canonical;
        });
      }
    }

    // If user still not found anywhere
    if (!userProfile) {
      return NextResponse.json(
        {
          error: 'No account found with this phone number or email. Please Register first to access Kisan Vyapar Portal.',
          notFound: true,
        },
        { status: 404 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 3. VERIFY PASSWORD
    // ─────────────────────────────────────────────────────────────
    const valid = verifyPassword(password, userProfile.password_hash);
    if (!valid) {
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

    // Dual-sync to local storage so future cold starts or offline loads are instant
    try {
      saveUser({
        id: userProfile.id,
        email: userProfile.email || `${canonical || userProfile.phone}@kisanvyapar.in`,
        full_name: userProfile.full_name,
        phone: canonical || userProfile.phone,
        password_hash: userProfile.password_hash || '',
        role: userProfile.role || 'buyer',
        district: userProfile.district || 'Meerut',
        state: userProfile.state || 'Uttar Pradesh',
        pincode: userProfile.pincode || '250002',
        avatar_url: userProfile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile.full_name)}`,
        farm_name: userProfile.farm_name,
        farm_description: userProfile.farm_description,
        crops_grown: userProfile.crops_grown,
        is_verified: userProfile.is_verified ?? true,
        created_at: userProfile.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (syncErr) {
      console.warn('[KVP Login] Local sync skipped:', syncErr);
    }

    console.log(`✅ [KVP Login] Authenticated user ${userProfile.full_name} (${userProfile.role})`);

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${userProfile.full_name}! Credentials verified successfully.`,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        phone: canonical || userProfile.phone,
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
