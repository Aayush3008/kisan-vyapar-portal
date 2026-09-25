'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, ArrowRight, Sparkles, ShieldCheck,
  TrendingUp, Clock, Sprout, Award, ChevronRight, Truck,
  Star, Users, Package, Leaf, ChevronDown, Play
} from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_RESOURCES, MOCK_FARMERS, MOCK_TESTIMONIALS } from '@/lib/mock-data';
import { CropCard } from '@/components/marketplace/CropCard';
import { WeatherWidget } from '@/components/marketplace/WeatherWidget';
import { Button } from '@/components/ui/Button';
import { useCrops } from '@/context/CropContext';

const SB = 'https://rafxxtiuagdmvvkoauuw.supabase.co/storage/v1/object/public';

const HERO_SLIDES = [
  {
    tagline: 'DIRECT FARM GATE TRADE ACROSS INDIA',
    headline: 'Harvest Fresh.\nSell Direct.',
    sub: 'Connect with 45,000+ verified farmers and wholesale buyers. Zero middlemen, genuine APMC pricing.',
    bg: `${SB}/site-assets/hero-wheat-field.jpg`,
    accent: '#6FBF78',
  },
  {
    tagline: 'DIRECT GRAIN MARKETS · MEERUT & WESTERN UP',
    headline: 'From Meerut Farms\nto Your Kitchen.',
    sub: 'GI-tagged Sharbati wheat, Pusa 1121 basmati paddy and seasonal harvests sourced directly from certified producers.',
    bg: `${SB}/site-assets/hero-farmer.jpg`,
    accent: '#B7791F',
  },
  {
    tagline: 'SEASONAL HARVEST · REAL-TIME MANDI RATES',
    headline: 'India\'s Freshest\nFarm Marketplace.',
    sub: 'Live APMC mandi benchmarks, soil advisories and 5-day weather forecasts — all in one trusted portal.',
    bg: `${SB}/site-assets/hero-harvest.jpg`,
    accent: '#6FBF78',
  },
];

const STATS = [
  { icon: Users,   value: '45,000+', label: 'Verified Farmers' },
  { icon: Package, value: '1,20,000+', label: 'Tonnes Traded' },
  { icon: Leaf,    value: '850+',    label: 'Active Listings' },
  { icon: Star,    value: '4.9/5',   label: 'Farmer Rating' },
];

const MANDI_PRICES = [
  { crop: 'Sharbati Wheat (Sehore)',       price: '₹3,450 / Qtl', change: '▲ 2.4%', up: true },
  { crop: 'Co-0238 Sugarcane (Meerut)',    price: '₹385 / Qtl',   change: '▲ 3.2%', up: true },
  { crop: '1121 Basmati Paddy (Karnal)',   price: '₹4,200 / Qtl', change: '▲ 1.8%', up: true },
  { crop: 'Pusa Bold Mustard (Mathura)',   price: '₹5,650 / Qtl', change: '▲ 1.5%', up: true },
  { crop: 'Nashik Red Onions (Garwa)',     price: '₹2,650 / Qtl', change: 'Steady',  up: null },
  { crop: 'Guntur Teja Chilli (Stemless)', price: '₹19,800 / Qtl',change: '▲ 3.1%', up: true },
  { crop: 'Chipsona Potatoes (Jalandhar)', price: '₹1,650 / Qtl', change: '▲ 0.8%', up: true },
  { crop: 'Desi Chana (Barabanki)',        price: '₹5,800 / Qtl', change: '▼ 0.6%', up: false },
  { crop: 'Mahim Ginger (Satara)',         price: '₹8,400 / Qtl', change: '▲ 2.1%', up: true },
  { crop: 'Byadgi Chilli (Karnataka)',     price: '₹24,000 / Qtl',change: '▲ 4.2%', up: true },
  { crop: 'Kashmiri Mongra Saffron',       price: '₹1,85,000 / Kg',change: '▲ 5.0%', up: true },
];

export default function HomePage() {
  const { crops } = useCrops();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [slide, setSlide] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(p => (p + 1) % MOCK_TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const current = HERO_SLIDES[slide];

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════
          CINEMATIC FULL-VIEWPORT HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden">

        {/* Background Image with Ken Burns effect */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={current.bg}
              alt="Hero"
              className="w-full h-full object-cover"
            />
            {/* Multi-layer dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-28 pb-20 flex flex-col lg:flex-row items-center lg:items-end gap-16 min-h-screen">

          {/* Left — Main Text */}
          <div className="flex-1 text-white space-y-7 lg:pb-20">

            {/* Tagline pill */}
            <AnimatePresence mode="wait">
              <motion.p
                key={slide + 'tag'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="tracking-[0.2em] text-[11px] sm:text-xs font-bold uppercase text-white/60"
              >
                {current.tagline}
              </motion.p>
            </AnimatePresence>

            {/* Big headline */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={slide + 'h'}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-serif text-5xl sm:text-7xl lg:text-8xl xl:text-[96px] font-bold leading-[1.05] tracking-tight"
                style={{ whiteSpace: 'pre-line' }}
              >
                {current.headline}
              </motion.h1>
            </AnimatePresence>

            {/* Subtitle */}
            <AnimatePresence mode="wait">
              <motion.p
                key={slide + 's'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-base sm:text-lg text-white/70 max-w-lg leading-relaxed"
              >
                {current.sub}
              </motion.p>
            </AnimatePresence>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link
                href="/crops"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-[#2D7A46] hover:bg-[#25693a] text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
              >
                <span>EXPLORE HARVEST</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/farmer/listings/new"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-bold rounded-full backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-95"
              >
                <Sprout className="w-4 h-4" />
                <span>SELL YOUR CROP</span>
              </Link>
            </motion.div>

            {/* Slide indicators */}
            <div className="flex items-center gap-3 pt-4">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`transition-all duration-500 rounded-full ${
                    i === slide ? 'w-10 h-1.5 bg-[#6FBF78]' : 'w-2 h-1.5 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
              <span className="text-white/40 text-[11px] ml-2 font-mono">
                {String(slide + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Right — Floating Search + Live Mandi Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="w-full lg:w-[420px] shrink-0 space-y-4 lg:pb-20"
          >
            {/* Search Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Find Nearest Crops</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const params = new URLSearchParams();
                  if (searchQuery.trim()) params.set('query', searchQuery.trim());
                  if (selectedState !== 'all') params.set('state', selectedState);
                  router.push(`/crops?${params.toString()}`);
                }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3">
                  <Search className="w-4 h-4 text-[#2D7A46] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="wheat, basmati, chilli, onion..."
                    className="flex-1 text-sm text-[#1E2A22] placeholder-stone-400 focus:outline-none bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-white/50 shrink-0" />
                  <select
                    className="flex-1 text-sm text-white bg-transparent focus:outline-none cursor-pointer"
                    value={selectedState}
                    onChange={e => setSelectedState(e.target.value)}
                  >
                    <option value="all" className="text-black">All States (Nearest First)</option>
                    <option value="Madhya Pradesh" className="text-black">Madhya Pradesh</option>
                    <option value="Haryana" className="text-black">Punjab & Haryana</option>
                    <option value="Maharashtra" className="text-black">Maharashtra</option>
                    <option value="Uttar Pradesh" className="text-black">Uttar Pradesh</option>
                    <option value="Andhra Pradesh" className="text-black">Andhra Pradesh</option>
                    <option value="Karnataka" className="text-black">Karnataka</option>
                    <option value="Tamil Nadu" className="text-black">Tamil Nadu</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#2D7A46] hover:bg-[#25693a] text-white text-sm font-bold rounded-xl transition-all hover:shadow-lg active:scale-95"
                >
                  Search Crops
                </button>
              </form>
            </div>

            {/* Live Mandi Ticker Card */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5 space-y-2 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#6FBF78] rounded-full animate-pulse" />
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Live Mandi Rates</p>
                </div>
                <span className="text-[10px] text-white/30">APMC Verified</span>
              </div>
              {MANDI_PRICES.slice(0, 4).map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-white/60 text-xs truncate pr-2">{m.crop}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-white text-xs font-bold">{m.price}</span>
                    <span className={`text-[10px] font-semibold ${m.up === true ? 'text-[#6FBF78]' : m.up === false ? 'text-red-400' : 'text-white/40'}`}>{m.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30"
        >
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#1E2A22] py-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <s.icon className="w-6 h-6 text-[#6FBF78] mb-2" />
                <p className="font-serif text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/40 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TRUST MARQUEE
      ══════════════════════════════════════════════════ */}
      <section className="border-y border-black/5 bg-[#FAFCFA] py-4 overflow-hidden">
        <div className="flex space-x-10 animate-marquee whitespace-nowrap text-xs font-bold text-[#1E2A22]">
          {[1, 2].map((loop) => (
            <div key={loop} className="flex items-center space-x-8 sm:space-x-12 shrink-0">
              {[
                [ShieldCheck, '#2D7A46', '100% Direct Farm Gate Trade'],
                [Award, '#B7791F', 'Government-ID & Land Verified Farmers'],
                [TrendingUp, '#2D7A46', 'Capped Under National APMC Mandi Rates'],
                [Truck, '#2D7A46', 'Secure COD & Razorpay Escrow'],
                [Sprout, '#2D7A46', 'Strict Agmark & Moisture Quality Inspection'],
              ].map(([Icon, color, text], idx) => (
                <React.Fragment key={idx}>
                  <span className="flex items-center space-x-2" style={{ color: color as string }}>
                    <Icon className="w-4 h-4" />
                    <span>{text as string}</span>
                  </span>
                  <span className="text-stone-300">•</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CATEGORIES GRID
      ══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-3">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#2D7A46] mb-2">Commodity Groups</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1E2A22]">Explore Mandi Categories</h2>
            <p className="text-sm text-[#617064] mt-2">Directly sourced harvest sorted by agronomic commodity group</p>
          </div>
          <Link href="/crops" className="text-xs font-bold text-[#2D7A46] hover:underline flex items-center gap-1">
            <span>View All Categories</span><ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {MOCK_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06, duration: 0.4 }}
            >
              <Link
                href={`/crops?category=${cat.slug}`}
                className="group rounded-2xl border border-black/5 bg-white p-3 shadow-sm hover:shadow-lg hover:border-[#2D7A46]/30 transition-all flex flex-col items-center text-center overflow-hidden block hover:-translate-y-1"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-3 bg-stone-100">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-[#1E2A22] group-hover:text-[#2D7A46] transition-colors leading-tight">{cat.name}</h3>
                <span className="text-[11px] text-[#617064] mt-1">{cat.count}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FRESHLY HARVESTED CROPS
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#FAFCFA] py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2D7A46] mb-2">
                <Clock className="w-3.5 h-3.5" /><span>Direct From Field</span>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1E2A22]">Freshly Harvested Crops</h2>
              <p className="text-sm text-[#617064] mt-2">Active listings harvested within the last 72 hours across Indian agricultural clusters</p>
            </div>
            <Link href="/crops?sort=freshest" className="text-xs font-bold text-[#2D7A46] hover:underline flex items-center gap-1">
              <span>Explore All 850+ Active Batches</span><ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {crops.map((crop, idx) => (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06, duration: 0.5 }}
              >
                <CropCard crop={crop} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURED FARMERS STRIP
      ══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-3">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#B7791F] mb-2">Certified Producers</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1E2A22]">Meet Our Top Farmers</h2>
            <p className="text-sm text-[#617064] mt-2">Government-ID verified, land-certified agricultural producers trading across India</p>
          </div>
          <Link href="/crops" className="text-xs font-bold text-[#2D7A46] hover:underline flex items-center gap-1">
            <span>Browse All Farmers</span><ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {MOCK_FARMERS.map((f, idx) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07, duration: 0.4 }}
              className="group flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-black/5 hover:border-[#2D7A46]/30 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
            >
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2D7A46] to-[#6FBF78] flex items-center justify-center text-white font-bold text-lg mb-3 shadow-md group-hover:scale-105 transition-transform">
                {f.avatar}
              </div>
              {/* Verified badge */}
              {f.verified && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#2D7A46] bg-[#F3FAF4] px-2 py-0.5 rounded-full mb-2">
                  <ShieldCheck className="w-3 h-3" /><span>Verified</span>
                </div>
              )}
              <p className="text-xs font-bold text-[#1E2A22] leading-tight">{f.name}</p>
              <p className="text-[10px] text-[#617064] mt-0.5">{f.crop}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">{f.district}</p>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-bold text-[#1E2A22]">{f.rating}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          WEATHER + MANDI PRICES SIDE BY SIDE
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#FAFCFA] py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2">
              <WeatherWidget initialDistrict="Meerut, Uttar Pradesh" />
            </div>

            <div className="rounded-3xl border border-black/5 bg-gradient-to-br from-[#1E2A22] to-[#25382b] text-white p-7 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#6FBF78]/10 blur-2xl" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-[#6FBF78] rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-[#6FBF78] uppercase tracking-widest">Live APMC Rates</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mb-1">Today's Mandi Benchmark</h3>
                <p className="text-xs text-stone-400 leading-relaxed">Compiled from national APMC market yards for transparent buyer-farmer parity.</p>

                <div className="mt-5 space-y-2">
                  {MANDI_PRICES.map((m, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 text-xs">
                      <span className="text-stone-300 truncate pr-2">{m.crop}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-white">{m.price}</span>
                        <span className={`text-[10px] font-semibold ${m.up === true ? 'text-[#6FBF78]' : m.up === false ? 'text-red-400' : 'text-stone-400'}`}>{m.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/crops">
                <button className="w-full py-3 border border-white/20 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all">
                  Explore Direct Mandi Listings →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          KNOWLEDGE HUB
      ══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-3">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#2D7A46] mb-2">Agronomic Guides</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1E2A22]">Agricultural Knowledge Hub</h2>
            <p className="text-sm text-[#617064] mt-2">Scientific soil management, pest control, and sustainable harvest guidelines</p>
          </div>
          <Link href="/resources" className="text-xs font-bold text-[#2D7A46] hover:underline flex items-center gap-1">
            <span>View All Guides</span><ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_RESOURCES.map((res, idx) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <Link
                href={`/resources/${res.slug}`}
                className="group rounded-3xl border border-black/5 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-full hover:-translate-y-1"
              >
                <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                  <img src={res.thumbnail_url} alt={res.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#2D7A46] font-semibold mb-2">
                      <span className="bg-[#F3FAF4] px-2.5 py-0.5 rounded-full border border-black/5">{res.topic_label}</span>
                      <span className="text-stone-400">{res.read_time}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#1E2A22] group-hover:text-[#2D7A46] transition-colors leading-snug">{res.title}</h3>
                    <p className="text-xs text-[#617064] mt-2 line-clamp-2 leading-relaxed">{res.summary}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#2D7A46]">
                    <span>Read Full Advisory</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS — AUTO-ROTATING
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#1E2A22] py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase text-[#6FBF78] mb-3">Success Stories</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white">Trusted by 45,000+ Indian Farmers & Buyers</h2>
          </div>

          {/* Large featured testimonial */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-[#6FBF78] text-2xl mb-4">{"★".repeat(MOCK_TESTIMONIALS[testimonialIdx].stars)}</div>
                <p className="font-serif text-2xl sm:text-3xl text-white/90 italic leading-relaxed mb-6">
                  &ldquo;{MOCK_TESTIMONIALS[testimonialIdx].quote}&rdquo;
                </p>
                <div>
                  <p className="text-white font-bold">{MOCK_TESTIMONIALS[testimonialIdx].name}</p>
                  <p className="text-white/40 text-sm">{MOCK_TESTIMONIALS[testimonialIdx].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {MOCK_TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`transition-all rounded-full ${i === testimonialIdx ? 'w-8 h-1.5 bg-[#6FBF78]' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>

          {/* All testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_TESTIMONIALS.slice(0, 3).map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 hover:bg-white/10 transition-all"
              >
                <div className="text-amber-400 text-sm">{"★".repeat(t.stars)}</div>
                <p className="text-xs text-white/70 italic leading-relaxed line-clamp-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs font-bold text-white">{t.name}</p>
                  <p className="text-[11px] text-white/40">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BOTTOM CTA BANNER
      ══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2D7A46] to-[#1E5C33] p-10 sm:p-16 text-white text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">Join India's Fastest Growing Farm Network</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold leading-tight">Start Trading Farm-Fresh Produce Today</h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Whether you're a farmer looking to sell direct, or a buyer seeking quality at fair prices — Kisan Vyapar is your verified agricultural marketplace.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href="/farmer/listings/new"
                className="px-8 py-4 bg-white text-[#2D7A46] text-sm font-bold rounded-full hover:bg-[#F3FAF4] transition-all shadow-lg hover:scale-[1.02] active:scale-95"
              >
                List Your Harvest →
              </Link>
              <Link
                href="/crops"
                className="px-8 py-4 bg-white/10 border border-white/20 text-white text-sm font-bold rounded-full hover:bg-white/20 transition-all backdrop-blur-sm hover:scale-[1.02] active:scale-95"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
