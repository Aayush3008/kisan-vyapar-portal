import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';
import { MOCK_COMMUNITY_POSTS } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      let query = supabase
        .from('community_posts')
        .select(`
          id,
          author_id,
          topic,
          title,
          body,
          image_url,
          status,
          upvotes,
          created_at,
          profiles (
            full_name,
            district,
            state
          )
        `)
        .eq('status', 'active');

      if (topic && topic !== 'all') {
        query = query.eq('topic', topic);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Also fetch reply counts for these posts
        const postIds = data.map((p) => p.id);
        const { data: replies } = await supabase
          .from('community_replies')
          .select('post_id')
          .in('post_id', postIds);

        const replyCounts: Record<string, number> = {};
        replies?.forEach((r) => {
          replyCounts[r.post_id] = (replyCounts[r.post_id] || 0) + 1;
        });

        const posts = data.map((p: any) => {
          const profile = p.profiles || {};
          const authorDistrict = profile.district
            ? `${profile.district}${profile.state ? ', ' + profile.state : ''}`
            : 'Verified Kisan';

          return {
            id: p.id,
            author_id: p.author_id,
            author_name: profile.full_name || 'Verified Kisan Member',
            author_district: authorDistrict,
            topic: p.topic,
            title: p.title,
            body: p.body,
            image_url: p.image_url,
            upvotes: p.upvotes || 0,
            reply_count: replyCounts[p.id] || 0,
            status: p.status,
            created_at: new Date(p.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
          };
        });

        return NextResponse.json({ success: true, posts });
      }
    }
  } catch (err) {
    console.warn('[API Community] Supabase read fallback:', err);
  }

  let filtered = MOCK_COMMUNITY_POSTS;
  if (topic && topic !== 'all') {
    filtered = filtered.filter((p) => p.topic === topic);
  }
  return NextResponse.json({ success: true, posts: filtered });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, body: content, topic, author_id, author_name, author_district } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Title and content are required.' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      
      // Ensure we have a valid author_id in profiles, or fallback to default farmer profile
      let validAuthorId = author_id;
      if (!validAuthorId || validAuthorId === 'current-user') {
        const { data: firstProfile } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
        validAuthorId = firstProfile?.id || '33333333-0001-0000-0000-000000000001';
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          title: title.trim(),
          body: content.trim(),
          topic: topic || 'Mandi Prices & Trends',
          author_id: validAuthorId,
          status: 'active',
          upvotes: 1,
        })
        .select()
        .single();

      if (error) {
        console.error('[API Community] Supabase insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        post: {
          id: data.id,
          author_id: data.author_id,
          author_name: author_name || 'Verified Kisan Member',
          author_district: author_district || 'Uttar Pradesh',
          topic: data.topic,
          title: data.title,
          body: data.body,
          upvotes: 1,
          reply_count: 0,
          status: 'active',
          created_at: 'Just now',
        },
      });
    }

    // Local fallback return
    return NextResponse.json({
      success: true,
      post: {
        id: `post-${Date.now()}`,
        author_id: author_id || 'current-user',
        author_name: author_name || 'Verified Kisan Member',
        author_district: author_district || 'Uttar Pradesh',
        topic: topic || 'Mandi Prices & Trends',
        title: title.trim(),
        body: content.trim(),
        upvotes: 1,
        reply_count: 0,
        status: 'active',
        created_at: 'Just now',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create post' }, { status: 500 });
  }
}
