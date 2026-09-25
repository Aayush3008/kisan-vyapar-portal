'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Kisan Vyapar runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-black/5 shadow-card">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            System Service Notice
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E2A22]">
            Something Encountered an Issue
          </h2>
          <p className="text-xs text-[#617064] leading-relaxed">
            Our agricultural data network experienced a temporary glitch while loading this record. You can try refreshing the page or head back to the marketplace.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} className="w-full flex items-center justify-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => (window.location.href = '/')}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
