import { createClient } from '@supabase/supabase-js';

/**
 * Checks whether real Supabase credentials are configured.
 * Returns false if env vars are missing or still contain placeholder values.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return (
    !!url &&
    !!key &&
    !url.includes('your-') &&
    !url.includes('placeholder') &&
    !key.includes('your-') &&
    !key.includes('placeholder') &&
    url.startsWith('https://') &&
    url.endsWith('.supabase.co')
  );
}

/**
 * Returns a Supabase admin client using the service role key.
 * This bypasses RLS and should ONLY be used server-side in API routes.
 * Throws an error if Supabase is not configured.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in your environment variables (Vercel Dashboard → Settings → Environment Variables).'
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
