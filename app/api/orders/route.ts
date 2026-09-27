import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';
import { 
  getAllOrders, 
  getOrdersByBuyer, 
  getOrdersByFarmer, 
  saveOrder as saveLocalOrder,
  getAllLocalCrops,
  updateLocalCrop 
} from '@/lib/local-db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const buyerId = searchParams.get('buyerId');
  const farmerId = searchParams.get('farmerId');
  const orderNumber = searchParams.get('orderNumber');

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          order_timeline (*)
        `)
        .order('placed_at', { ascending: false });

      if (orderNumber) {
        query = query.eq('order_number', orderNumber);
      } else if (farmerId) {
        query = query.eq('farmer_id', farmerId);
      } else if (buyerId) {
        query = query.eq('buyer_id', buyerId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        // Map to app order format
        const orders = data.map((o: any) => {
          const firstItem = o.order_items?.[0] || {};
          const addr = typeof o.shipping_address === 'string'
            ? JSON.parse(o.shipping_address)
            : o.shipping_address || {};

          const fullAddr = typeof addr === 'object'
            ? `${addr.addressLine1 || ''} ${addr.city || ''} ${addr.state || ''} ${addr.pincode || ''}`.trim()
            : String(addr);

          return {
            id: o.id,
            orderNumber: o.order_number,
            buyerId: o.buyer_id,
            farmerId: o.farmer_id,
            buyerName: addr.fullName || 'Valued Buyer',
            buyerPhone: addr.phone || '+91 98450 12890',
            cropTitle: firstItem.crop_title || 'Fresh Crop Lot',
            cropId: firstItem.listing_id || 'crop-lot',
            variety: firstItem.variety || 'Grade A Quality',
            quantity: firstItem.quantity || 1,
            unit: firstItem.unit || 'quintal',
            pricePerUnit: Number(firstItem.unit_price || 0),
            discountPercent: 0,
            discountAmount: Number(o.discount_amount || 0),
            totalAmount: Number(o.total_amount || 0),
            paymentMethod: o.payment_method || 'cod',
            paymentStatus: o.payment_status || 'pending',
            fulfillmentStatus: o.fulfillment_status || 'new',
            deliveryType: o.delivery_type || 'Farmer Door Delivery',
            deliveryAddress: fullAddr || 'Farm Gate Pickup',
            orderDate: new Date(o.placed_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            items: o.order_items || [],
            timeline: o.order_timeline || [],
          };
        });

        return NextResponse.json({ success: true, orders, source: 'supabase' });
      }
    }
  } catch (err) {
    console.warn('[API Orders] Supabase read fallback:', err);
  }

  // Local fallback with strict scoping by buyerId / farmerId
  try {
    let localOrders = [];
    if (orderNumber) {
      const all = getAllOrders();
      localOrders = all.filter((o) => o.orderNumber === orderNumber || o.id === orderNumber);
    } else if (buyerId) {
      localOrders = getOrdersByBuyer(buyerId);
    } else if (farmerId) {
      localOrders = getOrdersByFarmer(farmerId);
    } else {
      localOrders = getAllOrders();
    }

    return NextResponse.json({
      success: true,
      orders: localOrders,
      source: 'local',
    });
  } catch (localErr) {
    console.error('[API Orders] Local read error:', localErr);
    return NextResponse.json({
      success: true,
      orders: [],
      source: 'none',
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderNumber,
      buyerId,
      buyerName,
      buyerPhone,
      buyerEmail,
      cropTitle,
      cropId,
      farmerId,
      farmerName,
      variety,
      quantity = 1,
      unit = 'quintal',
      pricePerUnit = 0,
      discountPercent = 0,
      discountAmount = 0,
      totalAmount = 0,
      paymentMethod = 'cod',
      paymentStatus = 'pending',
      fulfillmentStatus = 'new',
      deliveryType = 'Farmer Door Delivery',
      deliveryAddress,
      shippingAddress,
    } = body;

    const finalOrderNumber = orderNumber || `ORD-KVP-${Math.floor(10000 + Math.random() * 90000)}`;
    const numQuantity = Number(quantity || 1);

    // 1. Always save in local storage DB for instant access and user isolation
    const savedLocalOrder = saveLocalOrder({
      orderNumber: finalOrderNumber,
      buyerId,
      buyerName,
      buyerPhone,
      buyerEmail,
      cropTitle,
      cropId,
      farmerId,
      farmerName,
      variety,
      quantity: numQuantity,
      unit,
      pricePerUnit: Number(pricePerUnit),
      discountPercent: Number(discountPercent),
      discountAmount: Number(discountAmount),
      totalAmount: Number(totalAmount),
      paymentMethod,
      paymentStatus,
      fulfillmentStatus,
      deliveryType,
      deliveryAddress,
      orderDate: 'Just Now',
    });

    // 2. Decrement crop stock in local db if cropId is known
    if (cropId) {
      try {
        const localCrops = getAllLocalCrops();
        const existingCrop = localCrops.find((c: any) => c.id === cropId);
        if (existingCrop) {
          const updatedStock = Math.max(0, (existingCrop.stock_quantity || 0) - numQuantity);
          updateLocalCrop(cropId, {
            stock_quantity: updatedStock,
            status: updatedStock === 0 ? 'sold_out' : existingCrop.status,
          });
        }
      } catch (e) {
        console.warn('Could not update local crop stock:', e);
      }
    }

    // 3. Dual-sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdmin();

        // Resolve valid buyer profile ID
        let resolvedBuyerId = buyerId;
        if (!resolvedBuyerId || typeof resolvedBuyerId !== 'string' || resolvedBuyerId.length < 10) {
          const { data: firstBuyer } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'buyer')
            .limit(1)
            .maybeSingle();
          resolvedBuyerId = firstBuyer?.id || '33333333-0006-0000-0000-000000000006';
        }

        // Resolve valid farmer profile ID
        let resolvedFarmerId = farmerId;
        if (!resolvedFarmerId || typeof resolvedFarmerId !== 'string' || resolvedFarmerId.length < 10) {
          const { data: firstFarmer } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'farmer')
            .limit(1)
            .maybeSingle();
          resolvedFarmerId = firstFarmer?.id || '33333333-0001-0000-0000-000000000001';
        }

        const addressData = shippingAddress || {
          fullName: buyerName,
          phone: buyerPhone,
          address: deliveryAddress,
        };

        // Insert into orders
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: finalOrderNumber,
            buyer_id: resolvedBuyerId,
            farmer_id: resolvedFarmerId,
            subtotal: Number(totalAmount || pricePerUnit * numQuantity),
            delivery_fee: deliveryType.includes('Pickup') ? 0 : 150,
            platform_fee: 0,
            discount_amount: Number(discountAmount || 0),
            total_amount: Number(totalAmount || pricePerUnit * numQuantity),
            payment_method: paymentMethod === 'cod' ? 'cod' : 'razorpay',
            payment_status: paymentStatus === 'paid' ? 'paid' : 'pending',
            fulfillment_status: fulfillmentStatus === 'new' ? 'pending' : (fulfillmentStatus || 'pending'),
            shipping_address: addressData,
            delivery_type: deliveryType,
          })
          .select()
          .single();

        if (!orderError && newOrder) {
          // Insert into order_items
          await supabase.from('order_items').insert({
            order_id: newOrder.id,
            listing_id: cropId,
            crop_title: cropTitle || 'Fresh Harvest Lot',
            variety: variety || 'Certified Standard',
            unit: unit || 'quintal',
            quantity: numQuantity,
            unit_price: Number(pricePerUnit),
            line_total: Number(totalAmount),
          });

          // Insert into order_timeline
          await supabase.from('order_timeline').insert({
            order_id: newOrder.id,
            status: 'Order Placed',
            note: `Order placed via ${paymentMethod.toUpperCase()} (${deliveryType}).`,
          });

          // Decrement stock in Supabase app_crop_listings
          if (cropId) {
            const { data: cropRow } = await supabase
              .from('app_crop_listings')
              .select('id, stock_quantity')
              .eq('id', cropId)
              .maybeSingle();

            if (cropRow) {
              const newStock = Math.max(0, (cropRow.stock_quantity || 0) - numQuantity);
              await supabase
                .from('app_crop_listings')
                .update({
                  stock_quantity: newStock,
                  status: newStock === 0 ? 'sold_out' : 'active',
                })
                .eq('id', cropId);
            }
          }

          return NextResponse.json({
            success: true,
            orderId: newOrder.id,
            orderNumber: finalOrderNumber,
            source: 'supabase',
          });
        }
      } catch (sbErr) {
        console.warn('[API Orders POST] Supabase insert warning:', sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: savedLocalOrder.id,
      orderNumber: finalOrderNumber,
      source: 'local',
    });
  } catch (err: any) {
    console.error('[API Orders POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to place order' }, { status: 500 });
  }
}
