import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';
import { MOCK_RESOURCES } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');
  const search = searchParams.get('search');

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      let query = supabase.from('resources').select('*').eq('is_published', true);

      if (topic && topic !== 'all') {
        query = query.eq('topic', topic);
      }

      if (search && search.trim() !== '') {
        query = query.ilike('title', `%${search.trim()}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const topicLabels: Record<string, string> = {
          soil_types: 'Soil Health & Prep',
          plant_diseases: 'Plant Diseases',
          pest_management: 'Pest Management',
          crop_management: 'Crop Management',
          sustainable_farming: 'Sustainable Farming',
        };

        const resources = data.map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          topic: r.topic,
          topic_label: topicLabels[r.topic] || r.topic,
          summary: r.summary,
          thumbnail_url: r.thumbnail_url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
          read_time: r.read_time || '5 min read',
          published_date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          content: r.content,
        }));
        return NextResponse.json({ success: true, resources });
      }
    }
  } catch (err) {
    console.warn('[API Resources] Supabase read fallback:', err);
  }

  // Fallback to MOCK_RESOURCES
  let filtered = MOCK_RESOURCES;
  if (topic && topic !== 'all') {
    filtered = filtered.filter((r) => r.topic === topic);
  }
  if (search && search.trim() !== '') {
    const q = search.toLowerCase();
    filtered = filtered.filter((r) => r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q));
  }

  return NextResponse.json({ success: true, resources: filtered });
}
