'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-emerald select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]";

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs tracking-wider uppercase",
      md: "h-11 px-5 text-sm",
      lg: "h-13 px-7 text-base font-semibold",
    };

    const variantStyles = {
      primary: "bg-[#2D7A46] text-white hover:bg-[#25663a] shadow-sm btn-shimmer bg-gradient-to-r from-[#2D7A46] via-[#389255] to-[#2D7A46]",
      secondary: "bg-[#F3FAF4] text-[#1E2A22] border border-[#6FBF78]/40 hover:bg-[#E5F3E7]",
      outline: "border border-black/10 bg-white text-[#1E2A22] hover:bg-stone-50 hover:border-black/20",
      ghost: "text-[#617064] hover:text-[#1E2A22] hover:bg-[#F3FAF4]",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };

    return (
      <motion.button
        ref={ref as any}
        whileTap={{ scale: 0.97 }}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        disabled={disabled || isLoading}
        {...(props as HTMLMotionProps<"button">)}
      >
        {isLoading ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
