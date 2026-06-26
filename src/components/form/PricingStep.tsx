'use client';

import { Check, Clock, GraduationCap, Star, Award, Users, AlertTriangle, CalendarClock } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { isInstallmentEligible, calcInstallment, formatNaira, REGISTRATION_FEE } from '@/lib/installment';

const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter Plan',
    duration: '1 Month (4 Weeks)',
    totalFee: '₦50,000',
    features: [
      'Introduction to STEM fundamentals',
      'Hands-on beginner coding projects',
      'Creative problem-solving activities',
      'Certificate of Participation',
      'Flexible learning schedule'
    ],
    popular: false,
  },
  {
    id: 'stem-explorer',
    name: 'STEM Explorer Program',
    duration: '2 Months (8 Weeks)',
    totalFee: '₦80,000',
    features: [
      'Project-based STEM curriculum',
      'Coding, robotics & AI fundamentals',
      'Real-world applications & activities',
      'Skill certification on completion',
      'Perfect for semester break learning'
    ],
    popular: true,
  },
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
  const paymentType = watch('payment.paymentType');
  const isInstallment = paymentType === 'installment';
  const hasCoupon = coupon && coupon.trim() !== '';

  // If coupon is applied, this step shouldn't render
  if (hasCoupon) {
    return null;
  }

  const selectedPlan = pricingPlans.find(p => p.id === selectedPlanId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Choose a Pricing Plan</h2>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Select the plan that best fits your learning goals.</p>
      </div>

      {/* Selectable Pricing Cards */}
      <Controller
        name="payment.selectedPlan"
        control={control}
        rules={{ required: 'Please select a pricing plan' }}
        render={({ field, fieldState }) => (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              {pricingPlans.map((plan) => {
                const isSelected = field.value === plan.id;
                return (
                  <label
                    key={plan.id}
                    className="relative cursor-pointer rounded-2xl border-2 p-4 transition-all block"
                    style={isSelected
                      ? { borderColor: '#D97706', backgroundColor: '#FFFAF3' }
                      : { borderColor: '#E7DCCB', backgroundColor: '#fff' }
                    }
                  >
                    <input type="radio" {...field} value={plan.id} checked={isSelected} className="sr-only" />
                    {plan.popular && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>
                        <Star size={9} /> Most Popular
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                        style={isSelected ? { borderColor: '#D97706', backgroundColor: '#D97706' } : { borderColor: '#E7DCCB' }}
                      >
                        {isSelected && <Check size={11} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm mb-0.5" style={{ color: '#1F2937' }}>{plan.name}</p>
                        <p className="text-xs flex items-center gap-1 mb-1.5" style={{ color: '#6B7280' }}>
                          <Clock size={12} style={{ color: '#D97706' }} /> {plan.duration}
                        </p>
                        <p className="text-lg font-black" style={{ color: '#D97706' }}>{plan.totalFee}</p>
                        {isInstallmentEligible(plan.id) ? (
                          <p className="text-[10px] mt-1 font-semibold" style={{ color: '#059669' }}>✓ Installment eligible</p>
                        ) : (
                          <p className="text-[10px] mt-1 font-semibold" style={{ color: '#9CA3AF' }}>Full payment only</p>
                        )}
                        <ul className="mt-2 space-y-1">
                          {plan.features.slice(0, 2).map((feature, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-1" style={{ color: '#6B7280' }}>
                              <Check size={11} className="mt-0.5 flex-shrink-0" style={{ color: '#15803D' }} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            {fieldState.error && (
              <p className="text-sm text-red-600 mt-2">{fieldState.error.message}</p>
            )}
          </>
        )}
      />

      {/* Selected Plan Summary */}
      {selectedPlan && (() => {
        const eligible = isInstallmentEligible(selectedPlan.id);
        const breakdown = isInstallment && eligible ? calcInstallment(selectedPlan.id) : null;
        return (
          <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#FFFAF3', border: '1px solid #E7DCCB' }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D97706' }}>Selected Plan</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm" style={{ color: '#1F2937' }}>{selectedPlan.name}</span>
              <span className="font-black text-base" style={{ color: '#D97706' }}>{selectedPlan.totalFee}</span>
            </div>
            <p className="text-xs" style={{ color: '#6B7280' }}>{selectedPlan.duration}</p>
            {breakdown && (
              <div className="rounded-xl p-3 space-y-1.5" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#1D4ED8' }}>Installment Breakdown</p>
                {[
                  ['Program Fee', formatNaira(breakdown.planFee)],
                  ['50% Due Today', formatNaira(breakdown.halfPlanFee)],
                  ['Registration Fee', formatNaira(REGISTRATION_FEE)],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-xs">
                    <span style={{ color: '#3B82F6' }}>{l}</span>
                    <span className="font-semibold" style={{ color: '#1E3A8A' }}>{v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-black pt-1.5" style={{ borderTop: '1px solid #BFDBFE', color: '#1D4ED8' }}>
                  <span>Amount Due Today</span>
                  <span>{formatNaira(breakdown.amountDueToday)}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: '#6B7280' }}>
                  <span>Outstanding Balance</span>
                  <span className="font-semibold" style={{ color: '#DC2626' }}>{formatNaira(breakdown.outstandingBalance)}</span>
                </div>
              </div>
            )}
            {isInstallment && !eligible && (
              <div className="rounded-xl p-3 flex items-start gap-2" style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#D97706' }} />
                <p className="text-xs" style={{ color: '#92400E' }}>Installment payment is not available for the Starter Plan. Please choose Full Payment or select a higher plan.</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Installment deadline notice */}
      {isInstallment && selectedPlan && isInstallmentEligible(selectedPlan.id) && (
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
          <CalendarClock size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: '#92400E' }}>Installment Payment Selected</p>
            <p className="text-xs leading-relaxed" style={{ color: '#78350F' }}>
              You are paying <strong>50% of the program fee plus the registration fee</strong> today.
              The remaining balance must be paid <strong>on or before the end of your child's first month of enrollment</strong>.
              Failure to complete the outstanding payment by this deadline will result in your child's classes being placed on hold.
            </p>
          </div>
        </div>
      )}

      {/* Premium Features */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: '#FFFAF3', border: '1px solid #E7DCCB' }}>
        <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#1F2937' }}>
          <Award size={16} style={{ color: '#D97706' }} />
          What Makes Our Program Premium
        </h3>
        <ul className="grid md:grid-cols-2 gap-2.5">
          {premiumFeatures.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#15803D' }} />
              <span className="text-sm" style={{ color: '#1F2937' }}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Additional Information */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E7DCCB' }}>
        <h3 className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#1F2937' }}>
          <GraduationCap size={16} style={{ color: '#D97706' }} />
          Additional Information
        </h3>
        <ul className="space-y-2">
          {additionalInfo.map((info, index) => (
            <li key={index} className="flex items-center gap-2 text-sm" style={{ color: '#1F2937' }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#D97706' }}></span>
              <span className="font-semibold">{info.label}:</span> <span style={{ color: '#6B7280' }}>{info.value}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Value Statement */}
      <div className="text-center rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #D97706 0%, #C2410C 100%)' }}>
        <Users className="mx-auto mb-3 opacity-90" size={28} />
        <h3 className="text-sm font-black uppercase tracking-widest mb-2">Our Promise to You</h3>
        <p className="text-sm opacity-90 max-w-xl mx-auto leading-relaxed">
          Our pricing reflects a premium learning experience where students build real projects,
          develop problem-solving skills, and gain future-ready digital expertise.
        </p>
      </div>
    </div>
  );
}
