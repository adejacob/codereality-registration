'use client';

import { useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Card from '../ui/Card';

const paymentOptions = [
  { id: 'full', name: 'Full Payment', description: 'Pay the complete amount upfront', icon: CreditCard, color: 'from-green-500 to-emerald-500', comingSoon: false },
  { id: 'installment', name: 'Installment Plan', description: 'Pay in convenient monthly installments', icon: Calendar, color: 'from-blue-500 to-indigo-500', comingSoon: true },
];

export type CouponStatus = 'idle' | 'validating' | 'valid' | 'invalid';

interface PaymentStepProps {
  couponStatus: CouponStatus;
  onCouponStatusChange: (status: CouponStatus) => void;
}

export default function PaymentStep({ couponStatus, onCouponStatusChange }: PaymentStepProps) {
  const { register, watch, setValue, setError, clearErrors, formState: { errors } } = useFormContext();
  const selectedPayment = watch('payment.paymentType');
  const couponCode = watch('payment.coupon') || '';

  const [couponMessage, setCouponMessage] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasCoupon = couponCode.trim() !== '' && couponStatus === 'valid';

  async function validateCoupon(code: string) {
    const trimmed = code.trim();
    if (!trimmed) {
      onCouponStatusChange('idle');
      setCouponMessage('');
      clearErrors('payment.coupon' as any);
      return;
    }
    onCouponStatusChange('validating');
    setCouponMessage('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        onCouponStatusChange('valid');
        setCouponMessage(data.data?.description || 'Coupon applied — no payment required.');
        clearErrors('payment.coupon' as any);
        setValue('payment.paymentType', undefined);
      } else {
        onCouponStatusChange('invalid');
        setCouponMessage(data.message || 'Invalid coupon code.');
        setError('payment.coupon' as any, { message: data.message || 'Invalid coupon code.' });
      }
    } catch {
      onCouponStatusChange('invalid');
      setCouponMessage('Could not validate coupon. Please try again.');
      setError('payment.coupon' as any, { message: 'Could not validate coupon. Please try again.' });
    }
  }

  function handleCouponChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    onCouponStatusChange('idle');
    setCouponMessage('');
    clearErrors('payment.coupon' as any);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setValue('payment.paymentType', undefined);
      return;
    }
    debounceRef.current = setTimeout(() => validateCoupon(value), 800);
  }

  const getError = () => {
    const error = errors.payment as any;
    return error?.paymentType?.message as string || error?.message as string;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Payment Preference
      </h2>
      
      {getError() && (
        <p className="text-sm text-red-500">{getError()}</p>
      )}

      {/* Coupon Code Input - Always show at top */}
      <Card className={`p-6 mb-6 ${
        couponStatus === 'valid' ? 'border-green-300' :
        couponStatus === 'invalid' ? 'border-red-300' : 'border-amber-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br text-white ${
            couponStatus === 'valid' ? 'from-green-500 to-emerald-500' :
            couponStatus === 'invalid' ? 'from-red-500 to-rose-500' :
            'from-amber-500 to-orange-500'
          }`}>
            <Tag size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Have a Coupon Code?
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter coupon code (optional)"
                {...register('payment.coupon', { onChange: handleCouponChange })}
                className={`w-full px-4 py-3 pr-10 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 font-mono uppercase ${
                  couponStatus === 'valid' ? 'border-green-400 focus:ring-green-400' :
                  couponStatus === 'invalid' ? 'border-red-400 focus:ring-red-400' :
                  'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {couponStatus === 'validating' && <Loader2 size={18} className="animate-spin text-gray-400" />}
                {couponStatus === 'valid'      && <CheckCircle size={18} className="text-green-500" />}
                {couponStatus === 'invalid'    && <XCircle size={18} className="text-red-500" />}
              </div>
            </div>
            {couponStatus === 'valid' && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 text-green-600 text-sm font-medium"
              >
                <CheckCircle size={15} />
                <span>{couponMessage}</span>
              </motion.div>
            )}
            {couponStatus === 'invalid' && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 text-red-600 text-sm font-medium"
              >
                <XCircle size={15} />
                <span>{couponMessage}</span>
              </motion.div>
            )}
          </div>
        </div>
      </Card>

      {/* Payment Options - Only show when NO coupon */}
      {!hasCoupon && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {paymentOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selectedPayment === option.id;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`p-6 transition-all duration-300 relative ${
                  option.comingSoon
                    ? 'opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 cursor-pointer'
                    : 'hover:shadow-lg cursor-pointer'
                }`}
                onClick={() => {
                  if (option.comingSoon) return;
                  setValue('payment.paymentType', option.id as 'full' | 'installment', {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                }}
              >
                {option.comingSoon && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                    Coming Soon
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${option.color} text-white`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {option.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {option.description}
                    </p>
                    <input
                      id={`payment-${option.id}`}
                      type="radio"
                      value={option.id}
                      {...register('payment.paymentType')}
                      className="sr-only"
                      disabled={option.comingSoon}
                    />
                    {isSelected && !option.comingSoon && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 font-medium"
                      >
                        <span className="w-2 h-2 bg-indigo-600 rounded-full" />
                        Selected
                      </motion.div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      )}

      {/* Free Registration Notice - Only show when coupon is confirmed valid */}
      {couponStatus === 'valid' && (
        <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 rounded-xl bg-green-500 text-white">
              <CheckCircle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                Free Registration
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your coupon code <span className="font-mono font-bold uppercase">{couponCode}</span> has been applied.
                No payment is required to complete your registration.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
