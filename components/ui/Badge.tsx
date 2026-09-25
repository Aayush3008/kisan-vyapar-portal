import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'gold' | 'sage' | 'outline' | 'red';
  className?: string;
  pulse?: boolean;
}

export function Badge({ children, variant = 'sage', className, pulse = false }: BadgeProps) {
  const variants = {
    emerald: 'bg-[#F3FAF4] text-[#2D7A46] border border-[#6FBF78]/40',
    gold: 'bg-[#FEF9EE] text-[#B7791F] border border-[#B7791F]/30',
    sage: 'bg-[#F3FAF4] text-[#617064] border border-black/5',
    outline: 'border border-black/15 text-[#1E2A22] bg-white',
    red: 'bg-red-50 text-red-700 border border-red-200',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase",
        variants[variant],
        pulse && "animate-pulse",
        className
      )}
    >
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
