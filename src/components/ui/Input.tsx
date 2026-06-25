'use client';

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-[#1F2937] mb-2 reg-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3.5 rounded-2xl border bg-white text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all duration-200 text-base reg-input ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-[#E7DCCB] hover:border-[#D97706]/50'} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
