'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, error, placeholder = ' ', ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="relative w-full mb-3">
        <input
          ref={ref}
          id={inputId}
          placeholder={placeholder}
          className={cn(
            "floating-input peer w-full rounded-lg border border-black/10 bg-white px-3.5 pt-5 pb-2 text-sm text-[#1E2A22] placeholder-transparent transition duration-200 ease-in-out focus:border-[#2D7A46] focus:outline-none focus:ring-1 focus:ring-[#2D7A46]",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="floating-label pointer-events-none absolute left-3.5 top-3.5 text-xs text-[#617064] transition-all duration-200 origin-[0] peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#617064] peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#2D7A46]"
        >
          {label}
        </label>
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
