'use client';

import { motion } from 'framer-motion';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Mobile progress bar */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D97706' }}>
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>{steps[currentStep]}</span>
        </div>
        <div className="w-full h-1.5 rounded-full reg-progress-track" style={{ backgroundColor: '#E7DCCB' }}>
          <motion.div
            className="h-1.5 rounded-full"
            style={{ backgroundColor: '#D97706' }}
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Desktop step dots */}
      <div className="hidden sm:flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
                style={
                  index < currentStep
                    ? { backgroundColor: '#15803D', color: '#fff' }
                    : index === currentStep
                    ? { backgroundColor: '#D97706', color: '#fff', boxShadow: '0 0 0 3px #FDE68A' }
                    : { backgroundColor: '#E7DCCB', color: '#9CA3AF' }
                }
              >
                {index < currentStep ? '✓' : index + 1}
              </motion.div>
              <span
                className="text-[11px] mt-1.5 text-center font-semibold"
                style={{ color: index === currentStep ? '#D97706' : index < currentStep ? '#15803D' : '#9CA3AF' }}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className="flex-1 h-1 mx-1.5 rounded-full transition-all duration-500"
                style={{ backgroundColor: index < currentStep ? '#15803D' : '#E7DCCB' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
