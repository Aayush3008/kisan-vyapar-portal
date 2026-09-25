'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Scale, 
  RotateCcw, 
  Lock, 
  FileText, 
  ChevronRight,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PoliciesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-black/5">
        <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#2D7A46] mb-1">
          <Scale className="w-4 h-4" />
          <span>Governance &amp; Agricultural Directives</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E2A22]">
          Platform Policies &amp; Direct Mandi Sale Terms
        </h1>
        <p className="text-xs sm:text-sm text-[#617064] mt-1">
          Operating rules ensuring fair pricing under APMC benchmarks, transparent weighments, escrow protections, and dispute mediation.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-8 text-xs sm:text-sm text-stone-800 leading-relaxed">
        {/* Section 1: APMC Benchmark Compliance */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5 shadow-subtle space-y-3">
          <h2 className="font-serif text-xl font-bold text-[#1E2A22] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#2D7A46]" />
            <span>1. APMC Mandi Benchmark Pricing Policy</span>
          </h2>
          <p>
            Kisan Vyapar Portal enforces direct farmer-to-buyer trade. To maintain fair wholesale rates for buyers and competitive revenue for farmers, listed produce prices must not exceed prevailing national APMC mandi rate benchmarks. Any listing exceeding authorized caps is flagged during automated quality moderation.
          </p>
        </div>

        {/* Section 2: Quality Inspection & Weighment */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5 shadow-subtle space-y-3">
          <h2 className="font-serif text-xl font-bold text-[#1E2A22] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2D7A46]" />
            <span>2. Farm Gate &amp; Delivery Weighment Protocols</span>
          </h2>
          <p>
            Physical sample checks and weighments are conducted on electronic weighbridges or certified platform scales at the dispatch farm gate or warehouse destination. Buyers are entitled to inspect moisture content percentages prior to finalizing handover receipt.
          </p>
        </div>

        {/* Section 3: Dispute Resolution & Replacement */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5 shadow-subtle space-y-3">
          <h2 className="font-serif text-xl font-bold text-[#1E2A22] flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#2D7A46]" />
            <span>3. Cancellation, Replacement &amp; Escrow Guarantee</span>
          </h2>
          <p>
            If harvested produce delivered differs in grade, moisture specifications, or packaging condition from the certified listing, buyers may initiate an immediate <strong>Replacement Request</strong> or <strong>Cancellation with Full Escrow Refund</strong> via their buyer dashboard within 48 hours of delivery.
          </p>
        </div>

        {/* Section 4: Farmer Data & Privacy */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5 shadow-subtle space-y-3">
          <h2 className="font-serif text-xl font-bold text-[#1E2A22] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#2D7A46]" />
            <span>4. Farmer Data Privacy &amp; Land Protection</span>
          </h2>
          <p>
            Detailed survey numbers and private farm addresses are kept strictly protected and are only shared with the confirmed logistics carrier upon order acceptance. Farmer mobile contacts are protected against spam marketing.
          </p>
        </div>
      </div>
    </div>
  );
}
