import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ success: true, settings: data });
      }
    }
  } catch (err) {
    console.warn('[API Settings GET] Fallback:', err);
  }

  return NextResponse.json({
    success: true,
    settings: {
      site_name: 'Kisan Vyapar Portal',
      tagline: 'Connecting Indian Farmers Directly to Wholesale & Retail Buyers',
      contact_email: 'support@kisanvyapar.in',
      phone: '+91 1800 200 4567',
      currency_code: 'INR',
      currency_symbol: '₹',
      announcement_text: 'Empowering farmers with zero-middlemen trading across India.',
    },
  });
}
