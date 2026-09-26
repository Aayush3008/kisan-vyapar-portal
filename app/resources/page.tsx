'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Search, ArrowRight, Sparkles } from 'lucide-react';
import { MOCK_RESOURCES } from '@/lib/mock-data';

export default function ResourcesPage() {
  const [resources, setResources] = useState(MOCK_RESOURCES);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/resources')
      .then((res) => res.json())
      .then((data) => {
        if (data.resources && Array.isArray(data.resources) && data.resources.length > 0) {
          setResources(data.resources);
        }
      })
      .catch((err) => console.warn('Could not load resources from Supabase:', err));
  }, []);

  const filtered = resources.filter((res) => {
    if (activeCategory !== 'all' && res.topic !== activeCategory) return false;
    if (search.trim() !== '') {
      return (
        res.title.toLowerCase().includes(search.toLowerCase()) ||
        res.summary.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="pb-6 border-b border-black/5">
        <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#2D7A46] mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Agricultural Knowledge & Research</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E2A22]">
          Agronomy Resource Hub
        </h1>
        <p className="text-sm text-[#617064] mt-1 max-w-2xl">
          Scientific soil management, pest control, disease remediation, and certified organic harvest practices vetted by agronomists.
        </p>

        {/* Filters and search */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: 'all', label: 'All Articles' },
              { id: 'soil_types', label: 'Soil Health & Prep' },
              { id: 'plant_diseases', label: 'Plant Diseases' },
              { id: 'pest_management', label: 'Integrated Pest Mgt (IPM)' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#2D7A46] text-white shadow-xs'
                    : 'bg-white border border-black/10 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search agronomy guides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs rounded-xl border border-black/10 px-3 py-2 text-[#1E2A22] focus:border-[#2D7A46] focus:outline-none bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((res) => (
          <Link
            key={res.id}
            href={`/resources/${res.slug}`}
            className="group rounded-3xl liquid-glass-card overflow-hidden transition-all flex flex-col justify-between"
          >
            <div className="aspect-[16/10] overflow-hidden bg-stone-100">
              <img
                src={res.thumbnail_url}
                alt={res.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs text-[#2D7A46] font-semibold mb-2">
                  <span className="bg-[#F3FAF4] px-2.5 py-0.5 rounded-full border border-black/5">{res.topic_label}</span>
                  <span>•</span>
                  <span className="text-stone-400">{res.read_time}</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1E2A22] group-hover:text-[#2D7A46] transition-colors leading-snug">
                  {res.title}
                </h3>
                <p className="text-xs text-[#617064] mt-2 line-clamp-3 leading-relaxed">
                  {res.summary}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#2D7A46]">
                <span>Read Full Scientific Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
