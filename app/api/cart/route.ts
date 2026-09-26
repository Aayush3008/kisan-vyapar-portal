import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const buyerId = searchParams.get('buyerId');

  if (!buyerId) {
    return NextResponse.json({ success: true, items: [] });
  }

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('buyer_id', buyerId);

      if (!error && data) {
        return NextResponse.json({ success: true, items: data });
      }
    }
  } catch (err) {
    console.warn('[API Cart GET] Fallback:', err);
  }

  return NextResponse.json({ success: true, items: [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buyerId, listingId, quantity = 1, deliveryChoice = 'pickup' } = body;

    if (!buyerId || !listingId) {
      return NextResponse.json({ error: 'buyerId and listingId are required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from('cart_items')
        .upsert(
          {
            buyer_id: buyerId,
            listing_id: listingId,
            quantity,
            delivery_choice: deliveryChoice,
          },
          { onConflict: 'buyer_id,listing_id' }
        )
        .select()
        .single();

      if (!error) {
        return NextResponse.json({ success: true, item: data });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const listingId = searchParams.get('listingId');

    if (isSupabaseConfigured() && buyerId) {
      const supabase = getSupabaseAdmin();
      let query = supabase.from('cart_items').delete().eq('buyer_id', buyerId);
      if (listingId) {
        query = query.eq('listing_id', listingId);
      }
      await query;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
