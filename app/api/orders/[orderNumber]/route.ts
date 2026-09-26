import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  const { orderNumber } = params;

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          order_timeline (*)
        `)
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ success: true, order: data });
      }
    }
  } catch (err) {
    console.warn('[API Order by Number] Supabase error:', err);
  }

  return NextResponse.json({
    success: true,
    order: {
      order_number: orderNumber,
      payment_method: 'cod',
      payment_status: 'pending',
      fulfillment_status: 'accepted',
      total_amount: 39600,
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  const { orderNumber } = params;

  try {
    const body = await request.json();
    const { status, note, vehicleNumber, trackingPhone } = body;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();

      // Find order
      const { data: order } = await supabase
        .from('orders')
        .select('id, fulfillment_status')
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (order) {
        // Update order status
        const updateFields: Record<string, any> = {
          fulfillment_status: status,
        };
        if (status === 'delivered') updateFields.delivered_at = new Date().toISOString();
        if (status === 'dispatched') updateFields.dispatched_at = new Date().toISOString();
        if (status === 'cancelled') updateFields.cancelled_at = new Date().toISOString();

        await supabase
          .from('orders')
          .update(updateFields)
          .eq('id', order.id);

        // Append to order_timeline
        await supabase.from('order_timeline').insert({
          order_id: order.id,
          status: status.charAt(0).toUpperCase() + status.slice(1),
          note: note || `Status updated to ${status}${vehicleNumber ? ' • Vehicle: ' + vehicleNumber : ''}${trackingPhone ? ' • Driver: ' + trackingPhone : ''}`,
        });

        return NextResponse.json({ success: true, updatedStatus: status });
      }
    }

    return NextResponse.json({ success: true, updatedStatus: status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
  }
}
