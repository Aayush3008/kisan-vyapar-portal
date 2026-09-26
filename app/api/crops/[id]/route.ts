import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/db';

// PUT /api/crops/[id] — Update a crop listing
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const updates: Record<string, any> = { ...body };
    delete updates.id; // Don't update the primary key
    delete updates._is_custom;

    // Recalculate discount price if relevant fields changed
    if (updates.discount_percentage !== undefined || updates.price_per_unit !== undefined) {
      const disc = Number(updates.discount_percentage ?? 0);
      const pr = Number(updates.price_per_unit ?? body.price_per_unit ?? 0);
      if (disc > 0 && pr > 0) {
        updates.discount_price_per_unit = pr * (1 - disc / 100);
      }
    }

    const { data, error } = await supabase
      .from('app_crop_listings')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('[KVP Crops PUT] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update crop listing: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, crop: data });
  } catch (err: any) {
    console.error('[KVP Crops PUT Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update crop listing.' },
      { status: 500 }
    );
  }
}

// DELETE /api/crops/[id] — Delete a crop listing
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('app_crop_listings')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('[KVP Crops DELETE] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete crop listing: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[KVP Crops DELETE Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete crop listing.' },
      { status: 500 }
    );
  }
}
