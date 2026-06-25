'use client';

import { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-[#1F2937] mb-2 reg-label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-3.5 rounded-2xl border bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all duration-200 text-base reg-input ${error ? 'border-red-400 focus:ring-red-400' : 'border-[#E7DCCB] hover:border-[#D97706]/50'} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
