'use client';

import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Sun, Check, Sparkles } from 'lucide-react';
import Card from '../ui/Card';

const holidayPlans = [
  {
    id: 'holiday-explorer',
    name: 'Starter Plan',
    mode: 'Online',
    duration: '1 Month (4 Weeks)',
    totalFee: '₦50,000',
    features: [
      'Live interactive online classes',
      'Introduction to coding fundamentals',
      'Fun STEM projects & activities',
      'Digital literacy skills',
      'Flexible daily schedule',
      'Certificate of Participation'
    ],
    popular: false,
  },
  {
    id: 'holiday-innovator',
    name: 'STEM Explorer Program',
    mode: 'Online',
    duration: '2 Months (8 Weeks)',
    totalFee: '₦80,000',
    features: [
      'Advanced online coding curriculum',
      'AI & Robotics introduction',
      'Real-world project building',
      '1-on-1 mentorship sessions',
      'Portfolio development',
      'Premium certification & career guidance',
      'Internship preparation support'
    ],
    popular: true,
  },
];

export default function HolidayPricingStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const selectedPlan = watch('payment.selectedPlan');

  const getError = () => {
    const error = errors.payment as any;
    return error?.selectedPlan?.message as string;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4"
        >
          <Sun className="w-8 h-8 text-orange-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Holiday Bootcamp Pricing
        </h2>
        <p className="text-gray-500 mt-2">
          Choose your holiday learning track
        </p>
      </div>

      {getError() && (
        <p className="text-sm text-red-500 text-center">{getError()}</p>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {holidayPlans.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'hover:shadow-lg'
                } ${plan.popular ? 'md:scale-105' : ''}`}
                onClick={() => {
                  setValue('payment.selectedPlan', plan.id, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl flex items-center gap-1">
                    <Sparkles size={12} />
                    POPULAR
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {plan.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {plan.mode}
                      </span>
                      <span>•</span>
                      <span>{plan.duration}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.totalFee}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Hidden Radio */}
                  <input
                    type="radio"
                    value={plan.id}
                    {...register('payment.selectedPlan')}
                    className="sr-only"
                  />

                  {/* Selection Indicator */}
                  <div className={`mt-4 py-2 px-4 rounded-lg text-center font-medium transition-colors ${
                    isSelected
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                    {isSelected ? '✓ Selected' : 'Select Plan'}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Registration Fee Note */}
      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
        <p className="text-sm text-amber-800 dark:text-amber-300 text-center">
          <strong>Note:</strong> A registration fee of ₦5,000 will be added to your total amount
        </p>
      </div>
    </div>
  );
}
