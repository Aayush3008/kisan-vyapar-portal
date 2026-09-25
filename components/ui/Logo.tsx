'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  isDark?: boolean;
}

export function Logo({ className = '', size = 'md', showSubtitle = true, isDark = false }: LogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center space-x-3 select-none group cursor-pointer ${className}`}>
      {/* Premium Multi-layer Botanical Emblem */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        className={`relative ${iconSizes[size]} rounded-2xl bg-gradient-to-br from-[#2D7A46] via-[#1E5C33] to-[#144223] p-0.5 shadow-md shadow-[#2D7A46]/20 transition-all flex items-center justify-center overflow-hidden border border-[#6FBF78]/30`}
      >
        {/* Glow ambient highlight */}
        <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-transparent opacity-60" />

        {/* Golden wheat sun rays behind sprout */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none"
        >
          <div className="w-16 h-16 border border-dashed border-[#B7791F] rounded-full" />
        </motion.div>

        {/* Custom Hand-Crafted Golden Wheat & Sprout SVG */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 relative z-10 drop-shadow-sm"
        >
          {/* Central Stem */}
          <path
            d="M16 28V9"
            stroke="#F3FAF4"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Top Golden Grain Seed */}
          <path
            d="M16 4C14.8 6 14.8 8 16 9C17.2 8 17.2 6 16 4Z"
            fill="#F6E05E"
            stroke="#B7791F"
            strokeWidth="0.8"
          />
          {/* Left Leaf 1 */}
          <path
            d="M16 13C12 12.5 9 14.5 9 18C12 18.5 15 16.5 16 13Z"
            fill="#6FBF78"
            stroke="#2D7A46"
            strokeWidth="0.8"
          />
          {/* Right Leaf 1 (Golden Grain) */}
          <path
            d="M16 16C20 15.5 23 17.5 23 21C20 21.5 17 19.5 16 16Z"
            fill="#F6D55C"
            stroke="#B7791F"
            strokeWidth="0.8"
          />
          {/* Left Leaf 2 */}
          <path
            d="M16 20C13 19.8 11 21.5 11 24C13 24.5 15 23 16 20Z"
            fill="#6FBF78"
          />
          {/* Soil Base Ring */}
          <circle cx="16" cy="27" r="2.2" fill="#E2E8F0" />
        </svg>

        {/* Shimmer line pass on hover */}
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/25 to-transparent -rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />
      </motion.div>

      {/* Typography Brandmark */}
      <div>
        <div className="flex items-center space-x-1.5">
          <span className={`font-serif ${titleSizes[size]} font-bold tracking-tight leading-none group-hover:text-[#6FBF78] transition-colors ${
            isDark ? 'text-white' : 'text-[#1E2A22]'
          }`}>
            Kisan Vyapar
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#6FBF78] animate-pulse" />
        </div>
        {showSubtitle && (
          <div className="flex items-center space-x-1 mt-0.5">
            <span className={`text-[10px] tracking-[0.16em] uppercase font-bold leading-none ${
              isDark ? 'text-[#6FBF78]' : 'text-[#2D7A46]'
            }`}>
              Direct Farm Mandi
            </span>
            <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-stone-300'}`}>•</span>
            <span className={`text-[9px] tracking-wide font-medium leading-none ${
              isDark ? 'text-stone-300' : 'text-[#617064]'
            }`}>
              Govt-Verified
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
