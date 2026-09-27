import { createClient } from '@supabase/supabase-js';

/**
 * Checks whether real Supabase credentials are configured.
 * Returns false if env vars are missing or still contain placeholder values.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return (
    !!url &&
    !!key &&
    !url.includes('your-') &&
    !url.includes('placeholder') &&
    !key.includes('your-') &&
    !key.includes('placeholder') &&
    url.startsWith('http')
  );
}

/**
 * Returns a Supabase admin client using the service role key (or anon key fallback).
 * This should ONLY be used server-side in API routes.
 * Throws an error if Supabase is not configured.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in your environment variables.'
    );
  }

  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = key.trim();

  return createClient(cleanUrl, cleanKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Safe version that returns null if Supabase is not configured or fails to initialize.
 */
export function getSupabaseAdminSafe() {
  try {
    if (!isSupabaseConfigured()) return null;
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}
