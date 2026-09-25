'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sprout, Search, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-6 liquid-glass-card p-8 sm:p-10"
      >
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#F3FAF4] text-[#2D7A46] flex items-center justify-center font-bold shadow-inner">
          <Sprout className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B7791F]">
            Page Destination Notice
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E2A22]">
            Lost in the Fields?
          </h1>
          <p className="text-xs sm:text-sm text-[#617064] leading-relaxed">
            The page or route you requested is either moved or not found. You can jump directly to the marketplace or your verified dashboard.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="flex-1">
            <Button className="w-full flex items-center justify-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <Link href="/crops" className="flex-1">
            <Button variant="secondary" className="w-full flex items-center justify-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Marketplace</span>
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
