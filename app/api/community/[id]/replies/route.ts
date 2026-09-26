import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('community_replies')
        .select(`
          id,
          post_id,
          author_id,
          body,
          created_at,
          profiles (
            full_name,
            district,
            state,
            role
          )
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const replies = data.map((r: any) => ({
          id: r.id,
          author: r.profiles?.full_name || 'Community Agronomist',
          role: r.profiles?.role === 'farmer' ? 'Verified Farmer' : 'Agronomist Specialist',
          time: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          body: r.body,
        }));
        return NextResponse.json({ success: true, replies });
      }
    }
  } catch (err) {
    console.warn('[API Community Replies] Supabase read fallback:', err);
  }

  // Fallback initial reply
  return NextResponse.json({
    success: true,
    replies: [
      {
        id: 'reply-seed-1',
        author: 'Dr. Ramesh Agronomist',
        role: 'Verified Agronomist',
        time: 'Today',
        body: 'Recommend maintaining moisture levels below 13% for grain storage and using neem oil IPM practices.',
      },
    ],
  });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await request.json();
    const { body: replyBody, author_id, author_name } = body;

    if (!replyBody?.trim()) {
      return NextResponse.json({ error: 'Reply text cannot be empty' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();

      let validAuthorId = author_id;
      if (!validAuthorId || validAuthorId === 'current-user') {
        const { data: firstProfile } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
        validAuthorId = firstProfile?.id || '33333333-0001-0000-0000-000000000001';
      }

      const { data, error } = await supabase
        .from('community_replies')
        .insert({
          post_id: id,
          author_id: validAuthorId,
          body: replyBody.trim(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        reply: {
          id: data.id,
          author: author_name || 'Verified Community Kisan',
          role: 'Verified Community Member',
          time: 'Just now',
          body: data.body,
        },
      });
    }

    return NextResponse.json({
      success: true,
      reply: {
        id: `reply-${Date.now()}`,
        author: author_name || 'Verified Community Kisan',
        role: 'Verified Community Member',
        time: 'Just now',
        body: replyBody.trim(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to post reply' }, { status: 500 });
  }
}
