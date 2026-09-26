import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      // Increment upvotes
      const { data: current } = await supabase
        .from('community_posts')
        .select('upvotes')
        .eq('id', id)
        .maybeSingle();

      const newVotes = (current?.upvotes || 0) + 1;
      await supabase
        .from('community_posts')
        .update({ upvotes: newVotes })
        .eq('id', id);

      return NextResponse.json({ success: true, upvotes: newVotes });
    }
  } catch (err) {
    console.warn('[API Community Upvote] Fallback:', err);
  }

  return NextResponse.json({ success: true, upvotes: 1 });
}
