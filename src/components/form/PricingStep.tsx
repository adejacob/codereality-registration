'use client';

import { motion } from 'framer-motion';
import { Check, Clock, GraduationCap, Star, Award, Users } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter Plan',
    duration: '1 Month (4 Weeks)',
    totalFee: '₦50,000',
    features: ['Perfect for beginners', 'Introduction to STEM basics', 'Weekly progress reports'],
    popular: false,
  },
  {
    id: 'growth',
    name: 'Growth Plan',
    duration: '3 Months (12 Weeks)',
    totalFee: '₦150,000',
    features: ['Comprehensive skill building', 'Hands-on projects', 'Monthly parent updates'],
    popular: true,
  },
  {
    id: 'mastery',
    name: 'Mastery Plan',
    duration: '6 Months (24 Weeks)',
    totalFee: '₦250,000 + ₦300,000',
    features: ['Advanced curriculum', 'Portfolio development', 'Certification included', 'Internship opportunities'],
    popular: false,
  },
  {
    id: 'short',
    name: 'Short Program',
    duration: '2 Month (8 Weeks)',
    totalFee: '₦100,000',
    features: ['Intensive learning', 'Project-based', 'Skill certification'],
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
  const { watch } = useFormContext();
  const coupon = watch('payment.coupon');
  const hasCoupon = coupon && coupon.trim() !== '';

  // If coupon is applied, this step shouldn't render
  if (hasCoupon) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4">
          <span className="text-lg font-bold text-indigo-600">RC</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">RC Number 9057670</p>
        <h2 className="text-2xl font-bold text-gray-900">PRICING PLAN</h2>
        <p className="text-gray-500 mt-2">Flexible Subscription Packages</p>
      </div>

      {/* Pricing Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">PLAN</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">DURATION</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">TOTAL FEE</th>
            </tr>
          </thead>
          <tbody>
            {pricingPlans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3">
                  <div className="font-medium text-gray-900">{plan.name}</div>
                  {plan.popular && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <Star size={10} />
                      Most Popular
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" />
                    {plan.duration}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <span className="font-semibold text-indigo-600">{plan.totalFee}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
