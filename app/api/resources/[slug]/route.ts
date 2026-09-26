import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';
import { MOCK_RESOURCES } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        const topicLabels: Record<string, string> = {
          soil_types: 'Soil Health & Prep',
          plant_diseases: 'Plant Diseases',
          pest_management: 'Pest Management',
          crop_management: 'Crop Management',
          sustainable_farming: 'Sustainable Farming',
        };

        const resource = {
          id: data.id,
          title: data.title,
          slug: data.slug,
          topic: data.topic,
          topic_label: topicLabels[data.topic] || data.topic,
          summary: data.summary,
          thumbnail_url: data.thumbnail_url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
          read_time: data.read_time || '5 min read',
          published_date: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          content: data.content,
        };
        return NextResponse.json({ success: true, resource });
      }
    }
  } catch (err) {
    console.warn('[API Resource By Slug] Supabase read fallback:', err);
  }

  const found = MOCK_RESOURCES.find((r) => r.slug === slug) || MOCK_RESOURCES[0];
  return NextResponse.json({ success: true, resource: found });
}
