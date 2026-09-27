import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';
import { updateLocalCrop, deleteLocalCrop } from '@/lib/local-db';

export const dynamic = 'force-dynamic';

// PUT /api/crops/[id] — Update a crop listing
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updates: Record<string, any> = { ...body };
    delete updates.id;
    delete updates._is_custom;

    // Recalculate discount price if relevant fields changed
    if (updates.discount_percentage !== undefined || updates.price_per_unit !== undefined) {
      const disc = Number(updates.discount_percentage ?? 0);
      const pr = Number(updates.price_per_unit ?? body.price_per_unit ?? 0);
      if (disc > 0 && pr > 0) {
        updates.discount_price_per_unit = pr * (1 - disc / 100);
      }
    }

    // 1. Update in local storage
    const localUpdated = updateLocalCrop(params.id, updates);

    // 2. Dual-sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
          .from('app_crop_listings')
          .update(updates)
          .eq('id', params.id)
          .select()
          .maybeSingle();

        if (!error && data) {
          return NextResponse.json({ success: true, crop: data, source: 'supabase' });
        }
      } catch (sbErr) {
        console.warn('[KVP Crops PUT] Supabase update warning:', sbErr);
      }
    }

    return NextResponse.json({ success: true, crop: localUpdated, source: 'local' });
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
    deleteLocalCrop(params.id);

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdmin();
        await supabase
          .from('app_crop_listings')
          .delete()
          .eq('id', params.id);
      } catch (sbErr) {
        console.warn('[KVP Crops DELETE] Supabase delete warning:', sbErr);
      }
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
