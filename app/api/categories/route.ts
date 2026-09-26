import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';
import { MOCK_CATEGORIES } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        // Map to app shape
        const categories = data.map((c) => ({
          id: c.slug || c.id,
          db_id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
          count: c.description || 'Verified Produce',
        }));
        return NextResponse.json({ success: true, categories });
      }
    }
  } catch (err) {
    console.warn('[API Categories] Supabase read fallback:', err);
  }

  return NextResponse.json({ success: true, categories: MOCK_CATEGORIES });
}
