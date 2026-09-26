import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';

// GET /api/crops — Fetch all custom (user-created) crop listings from Supabase
export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ crops: [], source: 'none' });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('app_crop_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[KVP Crops GET] Supabase error:', error);
      return NextResponse.json({ crops: [], source: 'error' });
    }

    return NextResponse.json({ crops: data || [], source: 'supabase' });
  } catch (err: any) {
    console.error('[KVP Crops GET Error]', err);
    return NextResponse.json({ crops: [], source: 'error' });
  }
}

// POST /api/crops — Create a new crop listing in Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const slug = body.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const price = Number(body.pricePerUnit || body.price_per_unit || 3000);
    const discountPercent = Number(body.discountPercentage ?? body.discount_percentage ?? 0);
    const discountPrice = discountPercent > 0 ? price * (1 - discountPercent / 100) : price;

    const cropRecord = {
      id: `crop-${Date.now()}`,
      farmer_id: body.farmer_id || 'farmer-custom',
      farmer_name: body.farmer_name || 'Farmer',
      farm_name: body.farm_name || 'Farm',
      farmer_rating: 5.0,
      farmer_verified: true,
      category_id: body.category_id || 'cat-grains',
      category_name: body.category_name || body.category || 'Grains & Cereals',
      title: body.title,
      slug,
      variety: body.variety || 'Certified Hybrid',
      grade: body.grade || 'Grade A',
      description: body.description || 'Freshly harvested agricultural produce direct from farm gate.',
      unit: body.unit || 'quintal',
      price_per_unit: price,
      discount_percentage: discountPercent,
      discount_price_per_unit: discountPrice,
      market_price_per_unit: Number(body.market_price_per_unit || (price * 1.08)),
      distance_km: body.distance_km || Math.floor(5 + Math.random() * 25),
      min_order_quantity: Number(body.minOrderQuantity || body.min_order_quantity || 1),
      stock_quantity: Number(body.totalQuantity || body.stock_quantity || 100),
      reserved_quantity: 0,
      harvest_date: body.harvestDate || body.harvest_date || new Date().toISOString().split('T')[0],
      district: body.district || 'Meerut',
      state: body.state || 'Uttar Pradesh',
      pickup_available: body.pickupAvailable ?? body.pickup_available ?? true,
      delivery_available: body.deliveryAvailable ?? body.delivery_available ?? true,
      delivery_fee_per_unit: Number(body.deliveryFee || body.delivery_fee_per_unit || 120),
      soil_type: body.soilType || 'Deep Alluvial Loam',
      farming_method: body.farmingMethod || 'Natural Organic',
      status: 'active',
      primary_image: body.imageUrl || body.primary_image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      images: [
        body.imageUrl || body.primary_image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      ],
    };

    const { data, error } = await supabase
      .from('app_crop_listings')
      .insert(cropRecord)
      .select()
      .single();

    if (error) {
      console.error('[KVP Crops POST] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create crop listing: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [KVP Crops] Created listing "${body.title}" (ID: ${data.id}) in app_crop_listings`);

    // Also sync to legacy crop_listings table if possible
    try {
      const { data: firstFarmer } = await supabase.from('profiles').select('id').eq('role', 'farmer').limit(1).maybeSingle();
      const farmerId = firstFarmer?.id || '33333333-0001-0000-0000-000000000001';

      await supabase.from('crop_listings').insert({
        farmer_id: farmerId,
        title: body.title,
        slug,
        variety: body.variety || 'Certified Hybrid',
        grade: body.grade || 'Grade A',
        description: body.description || 'Fresh harvest produce.',
        unit: body.unit || 'quintal',
        price_per_unit: price,
        min_order_quantity: Number(body.minOrderQuantity || 1),
        stock_quantity: Number(body.totalQuantity || 100),
        harvest_date: body.harvestDate || new Date().toISOString().split('T')[0],
        district: body.district || 'Meerut',
        state: body.state || 'Uttar Pradesh',
        status: 'active',
      });
    } catch (legacyErr) {
      console.warn('[KVP Crops] Optional crop_listings sync skipped:', legacyErr);
    }

    return NextResponse.json({ success: true, crop: data });
  } catch (err: any) {
    console.error('[KVP Crops POST Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create crop listing.' },
      { status: 500 }
    );
  }
}
