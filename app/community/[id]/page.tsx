'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  ThumbsUp, 
  ArrowLeft, 
  Send, 
  User, 
  MapPin, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { MOCK_COMMUNITY_POSTS } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function DiscussionDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const post = MOCK_COMMUNITY_POSTS.find((p) => p.id === params.id) || MOCK_COMMUNITY_POSTS[0];

  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [replies, setReplies] = useState([
    {
      id: 'rep-1',
      author: 'Dr. Virendra Sharma (Agronomist)',
      district: 'ICAR Krishi Vigyan Kendra',
      text: 'Ensure nitrogen application is reduced if humidity exceeds 75%. Spraying Pseudomonas fluorescens @ 5g/litre provides reliable biological barrier against false smut.',
      date: '2 hours ago',
      isExpert: true
    },
    {
      id: 'rep-2',
      author: 'Sukhdev Singh',
      district: 'Amritsar, Punjab',
      text: 'We encountered similar symptoms last kharif. Clean drainage channels immediately to prevent waterlogging around root zones.',
      date: '45 mins ago',
      isExpert: false
    }
  ]);
  const [newReply, setNewReply] = useState('');

  // Fetch replies from Supabase on mount
  useEffect(() => {
    fetch(`/api/community/${params.id}/replies`)
      .then((res) => res.json())
      .then((data) => {
        if (data.replies && Array.isArray(data.replies) && data.replies.length > 0) {
          const mapped = data.replies.map((r: any) => ({
            id: r.id,
            author: r.author,
            district: r.role || 'Verified Kisan',
            text: r.body,
            date: r.time,
            isExpert: r.role?.includes('Agronomist'),
          }));
          setReplies(mapped);
        }
      })
      .catch((err) => console.warn('Could not load replies from Supabase:', err));
  }, [params.id]);

  const handleUpvote = () => {
    if (!hasUpvoted) {
      setUpvotes((v) => v + 1);
      setHasUpvoted(true);
      fetch(`/api/community/${params.id}/upvote`, { method: 'POST' }).catch((err) =>
        console.warn('Upvote failed in db:', err)
      );
      toast('Upvoted discussion!', 'success');
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    const replyText = newReply.trim();
    setNewReply('');

    // Optimistic UI update
    setReplies((prev) => [
      ...prev,
      {
        id: `rep-${Date.now()}`,
        author: 'Verified Community Kisan',
        district: 'Current Location',
        text: replyText,
        date: 'Just now',
        isExpert: false
      }
    ]);

    try {
      await fetch(`/api/community/${params.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyText }),
      });
    } catch (err) {
      console.warn('Failed to save reply to Supabase:', err);
    }

    toast('Your answer was submitted to the thread!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link href="/community" className="inline-flex items-center space-x-2 text-xs font-bold text-[#2D7A46] hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Kisan Chopal Discussions</span>
      </Link>

      {/* Main Discussion Thread Card */}
      <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs bg-[#F3FAF4] text-[#2D7A46] font-bold px-3 py-1 rounded-full border border-black/5">
            {post.topic}
          </span>
          <span className="text-xs text-[#617064]">{post.created_at}</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1E2A22]">
          {post.title}
        </h1>

        <p className="text-sm text-[#1E2A22] leading-relaxed whitespace-pre-line">
          {post.body}
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-black/5 gap-4">
          <div className="flex items-center space-x-3 text-xs">
            <div className="w-9 h-9 rounded-xl bg-[#2D7A46] text-white flex items-center justify-center font-bold">
              {post.author_name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-[#1E2A22] block">{post.author_name}</span>
              <span className="text-[#617064]">{post.author_district}</span>
            </div>
          </div>

          <button
            onClick={handleUpvote}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              hasUpvoted
                ? 'bg-[#2D7A46] text-white border-transparent'
                : 'bg-[#F3FAF4] text-[#2D7A46] border-black/5 hover:bg-[#E5F3E7]'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Helpful ({upvotes})</span>
          </button>
        </div>
      </div>

      {/* Replies Thread */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#1E2A22] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#2D7A46]" />
          <span>Community Answers &amp; Agronomist Advice ({replies.length})</span>
        </h3>

        <div className="space-y-3">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className={`p-5 rounded-2xl border bg-white shadow-subtle space-y-2 ${
                reply.isExpert ? 'border-[#6FBF78] bg-[#F3FAF4]/30' : 'border-black/5'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#1E2A22]">{reply.author}</span>
                  {reply.isExpert && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#2D7A46]" />
                      Agronomist
                    </span>
                  )}
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-500">{reply.district}</span>
                </div>
                <span className="text-[11px] text-stone-400">{reply.date}</span>
              </div>
              <p className="text-xs text-stone-800 leading-relaxed">{reply.text}</p>
            </div>
          ))}
        </div>

        {/* Reply Input Form */}
        <form onSubmit={handlePostReply} className="p-4 bg-white rounded-2xl border border-black/10 shadow-sm space-y-3">
          <label className="text-xs font-bold text-[#1E2A22] block">
            Post an Advice / Field Observation
          </label>
          <textarea
            rows={3}
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Share your agricultural guidance or local field experience..."
            className="w-full text-xs p-3 rounded-xl border border-black/10 focus:outline-none focus:border-[#2D7A46]"
          />
          <div className="flex justify-end">
            <Button size="sm" type="submit" className="flex items-center space-x-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>Submit Answer</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
