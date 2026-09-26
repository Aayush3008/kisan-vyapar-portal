'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  BookOpen, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Sprout, 
  FileText,
  Share2
} from 'lucide-react';
import { MOCK_RESOURCES } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';

export default function ResourceDetailPage({ params }: { params: { slug: string } }) {
  const initialResource = MOCK_RESOURCES.find((r) => r.slug === params.slug) || MOCK_RESOURCES[0];
  const [resource, setResource] = useState(initialResource);

  useEffect(() => {
    fetch(`/api/resources/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.resource) {
          setResource(data.resource);
        }
      })
      .catch((err) => console.warn('Could not fetch resource from Supabase:', err));
  }, [params.slug]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link href="/resources" className="inline-flex items-center space-x-2 text-xs font-bold text-[#2D7A46] hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Agronomy Guides</span>
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#2D7A46]">
          <span className="bg-[#F3FAF4] px-3 py-1 rounded-full border border-black/5">
            {resource.topic_label}
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1 text-stone-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{resource.read_time}</span>
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E2A22] leading-tight">
          {resource.title}
        </h1>

        <p className="text-sm sm:text-base text-[#617064] leading-relaxed">
          {resource.summary}
        </p>
      </div>

      {/* Featured Image */}
      <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden bg-stone-100 border border-black/5 shadow-subtle">
        <img
          src={resource.thumbnail_url}
          alt={resource.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Advisory Content */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-black/5 shadow-card space-y-6 text-[#1E2A22] leading-relaxed text-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1E2A22]">
          Agronomic Principles &amp; Field Protocol
        </h2>
        <p>
          Successful crop cultivation requires a balanced equilibrium between soil organic carbon, moisture retention capacity, and microbiological activity. Implementing structured scientific practices safeguards crops against false smut, collar rot, and unseasonal rainfall hazards.
        </p>

        <div className="my-6 p-6 rounded-2xl bg-[#F3FAF4] border border-[#6FBF78]/40 space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#2D7A46] flex items-center gap-2">
            <Sprout className="w-5 h-5" />
            <span>Core Takeaways for Indian Producers</span>
          </h3>
          <ul className="space-y-2 text-xs text-stone-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2D7A46] shrink-0 mt-0.5" />
              <span>Maintain soil moisture between 60-70% field capacity during flowering and seed set.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2D7A46] shrink-0 mt-0.5" />
              <span>Rotate deep-rooted cereal crops with nitrogen-fixing pulses (Gram, Moong) to replenish nutrients.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2D7A46] shrink-0 mt-0.5" />
              <span>Conduct bio-sprays during early morning hours before 10:00 AM to prevent thermal evaporation drift.</span>
            </li>
          </ul>
        </div>

        <h3 className="font-serif text-xl font-bold text-[#1E2A22]">
          Seasonal Remediation Checklist
        </h3>
        <p>
          Before dispatching produce to the Kisan Vyapar platform, ensure harvest lots are moisture-tested under 12% for cereal grains and 8% for oilseeds. Raised farm-shed pallet storage prevents rodent contamination and maintains grade integrity.
        </p>
      </div>

      {/* Related Resources CTA */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-[#FAFCFA] border border-black/5">
        <div>
          <h4 className="font-serif font-bold text-base text-[#1E2A22]">Need Specific Pest or Soil Guidance?</h4>
          <p className="text-xs text-[#617064]">Join the Kisan Chopal community to consult with vetted agronomy specialists.</p>
        </div>
        <Link href="/community">
          <Button size="sm">Ask Kisan Chopal</Button>
        </Link>
      </div>
    </div>
  );
}
