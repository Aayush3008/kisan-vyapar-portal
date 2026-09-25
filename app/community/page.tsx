'use client';

import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Plus, 
  MapPin, 
  Send 
} from 'lucide-react';
import { MOCK_COMMUNITY_POSTS } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function CommunityPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState(MOCK_COMMUNITY_POSTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('all');

  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTopic, setNewTopic] = useState('Mandi Prices & Trends');

  const handleUpvote = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  };

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newBody.trim()) {
      toast('Please enter title and content for your question.', 'error');
      return;
    }

    const newPost = {
      id: `post-${Date.now()}`,
      author_id: 'current-user',
      author_name: 'Harpreet Gill',
      author_district: 'Patiala, Punjab',
      topic: newTopic,
      title: newTitle,
      body: newBody,
      upvotes: 1,
      reply_count: 0,
      status: 'active' as const,
      created_at: 'Just now',
    };

    setPosts([newPost, ...posts]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewBody('');
    toast('Your question was posted to Kisan Chopal!', 'success');
  };

  const filtered = posts.filter(
    (p) => selectedTopic === 'all' || p.topic === selectedTopic
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Community Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-black/5 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#2D7A46] mb-1">
            <Users className="w-4 h-4" />
            <span>Kisan Chopal • Farmer Community</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E2A22]">
            Farmer & Buyer Discussion Forum
          </h1>
          <p className="text-xs text-[#617064] mt-0.5">
            Share mandi procurement updates, disease advisories, and organic cultivation techniques.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Ask Question / Share Update</span>
        </Button>
      </div>

      {/* Topic Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {['all', 'Mandi Prices & Trends', 'Crop Diseases', 'Organic Farming', 'Soil Quality & Health', 'Equipment & Tech'].map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
              selectedTopic === t
                ? 'bg-[#2D7A46] text-white shadow-xs'
                : 'bg-white border border-black/10 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {t === 'all' ? 'All Discussions' : t}
          </button>
        ))}
      </div>

      {/* Post Threads Feed */}
      <div className="space-y-4">
        {filtered.map((post) => (
          <div key={post.id} className="p-6 rounded-3xl liquid-glass-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-[#1E2A22]">{post.author_name}</span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center space-x-1 text-[#617064]">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span>{post.author_district}</span>
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-400">{post.created_at}</span>
              </div>
              <span className="text-[10px] bg-[#F3FAF4] text-[#2D7A46] font-bold px-2 py-0.5 rounded-full">
                {post.topic}
              </span>
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-[#1E2A22] mb-1">
                {post.title}
              </h3>
              <p className="text-xs text-[#617064] leading-relaxed">
                {post.body}
              </p>
            </div>

            <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
              <button
                onClick={() => handleUpvote(post.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-[#F3FAF4] text-stone-700 hover:text-[#2D7A46] font-semibold transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Helpful ({post.upvotes})</span>
              </button>

              <div className="flex items-center space-x-1 text-[#617064]">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{post.reply_count} Responses</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Chopal Discussion">
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold uppercase text-[#617064] block mb-1">Topic Category</label>
            <select
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-black/10 focus:border-[#2D7A46] focus:outline-none"
            >
              <option>Mandi Prices & Trends</option>
              <option>Crop Diseases</option>
              <option>Organic Farming</option>
              <option>Equipment & Tech</option>
              <option>Government Schemes</option>
            </select>
          </div>
          <Input
            label="Discussion Title or Question"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div>
            <label className="text-xs font-bold uppercase text-[#617064] block mb-1">Detailed Description</label>
            <textarea
              rows={4}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Provide specific details about crop conditions, Mandi quotes, or questions..."
              className="w-full text-xs p-3 rounded-lg border border-black/10 focus:border-[#2D7A46] focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePost}>Submit Question</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
