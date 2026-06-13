'use client';

import { Check, Clock, GraduationCap, Star, Award, Users, Circle } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';

const pricingPlans = [
  {
    id: 'growth',
    name: 'Growth Plan',
    duration: '3 Months (12 Weeks)',
    totalFee: '₦150,000',
    features: [
      'Comprehensive skill building across STEM modules',
      'Hands-on coding, robotics & AI projects',
      'Monthly progress reports & parent updates',
      'Personalized learning pathway',
      'Access to all course materials & resources',
      'Certificate of Participation upon completion'
    ],
    popular: true,
  },
  {
    id: 'short',
    name: 'Short Program',
    duration: '2 Months (8 Weeks)',
    totalFee: '₦100,000',
    features: [
      'Intensive focused learning track',
      'Project-based curriculum with real-world applications',
      'Skill certification on completion',
      'Flexible scheduling options',
      'Perfect for holiday or semester break learning'
    ],
    popular: false,
  },
  {
    id: 'mastery',
    name: 'Mastery Plan',
    duration: '6 Months (24 Weeks)',
    totalFee: '₦250,000',
    features: [
      'Advanced comprehensive curriculum',
      'Professional portfolio development',
      'Industry-standard project experience',
      'Internship placement assistance',
      'Career guidance & mentorship support',
      'Premium certification & recommendation letters'
    ],
    popular: false,
  },
  {
    id: 'platinum',
    name: 'Platinum Plan',
    duration: '6 Months (24 Weeks)',
    totalFee: '₦300,000',
    features: [
      'Extended comprehensive learning experience',
      'All-inclusive premium curriculum access',
      'Advanced specialization tracks (Coding, AI, Robotics)',
      'Guaranteed internship placement',
      '1-on-1 mentorship from industry experts',
      'Lifetime alumni network access',
      'Premium certification with job placement support'
    ],
    popular: false,
  },
];

const premiumFeatures = [
  'Project-based, hands-on learning',
  'Real-world tools and technologies',
  'Progressive learning (Beginner → Advanced)',
  'Small group, guided instruction',
  'Final project presentation & certification',
];

const additionalInfo = [
  { label: 'Registration Fee', value: '₦5,000 (one-time)' },
  { label: 'Certificate', value: 'Issued upon completion' },
];

export default function PricingStep() {
  const { watch, control } = useFormContext();
  const coupon = watch('payment.coupon');
  const selectedPlanId = watch('payment.selectedPlan');
  const hasCoupon = coupon && coupon.trim() !== '';

  // If coupon is applied, this step shouldn't render
  if (hasCoupon) {
    return null;
  }

  const selectedPlan = pricingPlans.find(p => p.id === selectedPlanId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4">
          <span className="text-lg font-bold text-indigo-600">RC</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">RC Number 9057670</p>
        <h2 className="text-2xl font-bold text-gray-900">PRICING PLAN</h2>
        <p className="text-gray-500 mt-2">Select a plan to proceed with payment</p>
      </div>

      {/* Selectable Pricing Cards */}
      <Controller
        name="payment.selectedPlan"
        control={control}
        rules={{ required: 'Please select a pricing plan' }}
        render={({ field, fieldState }) => (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              {pricingPlans.map((plan) => (
                <label
                  key={plan.id}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    field.value === plan.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    {...field}
                    value={plan.id}
                    checked={field.value === plan.id}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 flex-shrink-0 ${
                      field.value === plan.id ? 'text-indigo-600' : 'text-gray-400'
                    }`}>
                      {field.value === plan.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{plan.name}</span>
                        {plan.popular && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            <Star size={10} />
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <Clock size={14} className="text-indigo-500" />
                        {plan.duration}
                      </p>
                      <p className="text-lg font-bold text-indigo-600">{plan.totalFee}</p>
                      <ul className="mt-2 space-y-1">
                        {plan.features.slice(0, 2).map((feature, idx) => (
                          <li key={idx} className="text-xs text-gray-500 flex items-start gap-1">
                            <Check size={12} className="mt-0.5 flex-shrink-0 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {fieldState.error && (
              <p className="text-sm text-red-600 mt-2">{fieldState.error.message}</p>
            )}
          </>
        )}
      />

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <h4 className="font-semibold text-indigo-900 mb-2">Selected Plan Summary</h4>
          <div className="flex justify-between items-center text-sm">
            <span className="text-indigo-700">{selectedPlan.name}</span>
            <span className="font-bold text-indigo-900">{selectedPlan.totalFee}</span>
          </div>
          <p className="text-xs text-indigo-600 mt-1">{selectedPlan.duration}</p>
        </div>
      )}

      {/* Premium Features */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="text-indigo-600" size={20} />
          WHAT MAKES OUR PROGRAM PREMIUM
        </h3>
        <ul className="grid md:grid-cols-2 gap-3">
          {premiumFeatures.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="text-indigo-600" size={20} />
          ADDITIONAL INFORMATION
        </h3>
        <ul className="space-y-2">
          {additionalInfo.map((info, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              <span className="font-medium">{info.label}:</span> {info.value}
            </li>
          ))}
        </ul>
      </div>

      {/* Value Statement */}
      <div className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <Users className="mx-auto mb-3 text-white/80" size={32} />
        <h3 className="text-lg font-semibold mb-2">VALUE STATEMENT</h3>
        <p className="text-sm text-white/90 max-w-2xl mx-auto">
          Our pricing reflects a premium learning experience where students build real projects, 
          develop problem-solving skills, and gain future-ready digital expertise.
        </p>
      </div>

      {/* Note */}
      <div className="text-center text-sm text-gray-500">
        <p>Click &quot;Next&quot; to review your registration details before submitting.</p>
      </div>
    </div>
  );
}
