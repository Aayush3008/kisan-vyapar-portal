import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get('code') || '').toUpperCase().trim();

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Please enter a coupon code' }, { status: 400 });
  }

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (!error && data) {
        // Increment usage count in background
        await supabase
          .from('coupons')
          .update({ times_used: (data.times_used || 0) + 1 })
          .eq('id', data.id);

        return NextResponse.json({
          valid: true,
          code: data.code,
          discount_percent: Number(data.discount_percent || 0),
          discount_fixed: Number(data.discount_fixed || 0),
          min_order_amount: Number(data.min_order_amount || 0),
        });
      }
    }
  } catch (err) {
    console.warn('[API Coupons GET] Fallback:', err);
  }

  // Fallback to recognized promo codes
  const FALLBACK_COUPONS: Record<string, any> = {
    KVPSPECIAL: { discount_percent: 10, discount_fixed: 0, min_order_amount: 5000 },
    FARMER50: { discount_percent: 0, discount_fixed: 500, min_order_amount: 10000 },
    KISAN10: { discount_percent: 5, discount_fixed: 0, min_order_amount: 2000 },
    HARVEST100: { discount_percent: 0, discount_fixed: 1000, min_order_amount: 25000 },
  };

  if (FALLBACK_COUPONS[code]) {
    return NextResponse.json({
      valid: true,
      code,
      ...FALLBACK_COUPONS[code],
    });
  }

  return NextResponse.json({ valid: false, error: 'Invalid or expired coupon code.' }, { status: 404 });
}
