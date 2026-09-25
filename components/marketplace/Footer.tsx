import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="bg-[#1E2A22] text-[#F3FAF4] border-t border-black/10">
      {/* Verification & Trust Ticker */}
      <div className="bg-[#2D7A46] text-white py-3 px-4 border-b border-white/10 text-xs font-medium overflow-hidden whitespace-nowrap">
        <div className="flex items-center justify-around space-x-8 animate-marquee">
          <span className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Direct Farm-to-Buyer Trade</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Government-ID Verified Farmers</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Transparent Fair Pricing & Quality Grading</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Cash on Delivery & Razorpay Gateway</span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Logo size="md" isDark={true} />
            <p className="text-xs text-stone-300 leading-relaxed">
              India&apos;s premier digital agricultural mandi empowering farmers with verified direct trade, transparent APMC rates, real-time weather alerts, and agronomist guidance.
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-1">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#6FBF78]" />
                <span>Agricultural Trade Corridor, New Delhi, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-[#6FBF78]" />
                <span>Kisan Helpline: 1800-200-4567 (Toll Free)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-[#6FBF78]" />
                <span>support@kisanvyapar.in</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white mb-4">Mandi Categories</h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li><Link href="/crops?category=grains-cereals" className="hover:text-[#6FBF78] transition-colors">Grains &amp; Cereals (Sharbati, Basmati)</Link></li>
              <li><Link href="/crops?category=pulses-legumes" className="hover:text-[#6FBF78] transition-colors">Pulses &amp; Legumes (Chana, Tur, Moong)</Link></li>
              <li><Link href="/crops?category=fresh-fruits" className="hover:text-[#6FBF78] transition-colors">Fresh Fruits (GI Alphonso, Apples)</Link></li>
              <li><Link href="/crops?category=vegetables" className="hover:text-[#6FBF78] transition-colors">Vegetables (Nashik Onions, Potatoes)</Link></li>
              <li><Link href="/crops?category=spices" className="hover:text-[#6FBF78] transition-colors">Spices &amp; Condiments (Guntur Chilli)</Link></li>
              <li><Link href="/crops?category=organic-produce" className="hover:text-[#6FBF78] transition-colors">Certified Organic Harvest</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white mb-4">Farmer Resources</h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li><Link href="/weather" className="hover:text-[#6FBF78] transition-colors">5-Day Weather &amp; Spray Forecast</Link></li>
              <li><Link href="/resources" className="hover:text-[#6FBF78] transition-colors">Soil Prep &amp; Pest Management Guides</Link></li>
              <li><Link href="/community" className="hover:text-[#6FBF78] transition-colors">Kisan Chopal Community Forum</Link></li>
              <li><Link href="/farmer/listings/new" className="hover:text-[#6FBF78] transition-colors">List Your Harvested Crops</Link></li>
              <li><Link href="/admin" className="hover:text-[#6FBF78] transition-colors">Marketplace Moderation Panel</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white mb-4">Compliance &amp; Safety</h4>
            <p className="text-xs text-stone-400 mb-3 leading-relaxed">
              Kisan Vyapar operates in compliance with agricultural marketing directives. Crop weights and quality grades are inspected upon dispatch.
            </p>
            <ul className="space-y-2 text-xs text-stone-300">
              <li><Link href="/policies" className="hover:text-[#6FBF78] transition-colors">APMC Direct Sale Terms</Link></li>
              <li><Link href="/policies" className="hover:text-[#6FBF78] transition-colors">Dispute Resolution &amp; Refunds</Link></li>
              <li><Link href="/policies" className="hover:text-[#6FBF78] transition-colors">Privacy Policy &amp; Farmer Data</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Kisan Vyapar Portal. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed for Indian Agriculture • Production Build</p>
        </div>
      </div>
    </footer>
  );
}
