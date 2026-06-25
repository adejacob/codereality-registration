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
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Payment Preference</h2>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Select how you&apos;d like to complete your enrolment.</p>
      </div>
      
      {getError() && (
        <p className="text-sm text-red-500">{getError()}</p>
      )}

      {/* Coupon Code Input */}
      <Card
        className="p-5"
        style={{
          borderColor: couponStatus === 'valid' ? '#86EFAC' : couponStatus === 'invalid' ? '#FCA5A5' : '#E7DCCB',
          backgroundColor: couponStatus === 'valid' ? '#F0FDF4' : couponStatus === 'invalid' ? '#FFF5F5' : '#FFFAF3',
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 p-2.5 rounded-xl text-white"
            style={{ backgroundColor: couponStatus === 'valid' ? '#15803D' : couponStatus === 'invalid' ? '#DC2626' : '#D97706' }}
          >
            <Tag size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-2" style={{ color: '#1F2937' }}>Have a Coupon Code?</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter coupon code (optional)"
                {...register('payment.coupon', { onChange: handleCouponChange })}
                className={`w-full px-4 py-3 pr-10 rounded-2xl border bg-white text-base font-mono uppercase focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 reg-input ${
                  couponStatus === 'valid'   ? 'border-green-300 focus:ring-green-400' :
                  couponStatus === 'invalid' ? 'border-red-300 focus:ring-red-400' :
                  'border-[#E7DCCB] focus:ring-[#D97706]'
                }`}
                style={{ color: '#1F2937' }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {couponStatus === 'validating' && <Loader2 size={17} className="animate-spin" style={{ color: '#D97706' }} />}
                {couponStatus === 'valid'      && <CheckCircle size={17} style={{ color: '#15803D' }} />}
                {couponStatus === 'invalid'    && <XCircle size={17} className="text-red-500" />}
              </div>
            </div>
            {couponStatus === 'valid' && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 mt-2 text-xs font-semibold" style={{ color: '#15803D' }}
              >
                <CheckCircle size={13} /> {couponMessage}
              </motion.div>
            )}
            {couponStatus === 'invalid' && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-red-600"
              >
                <XCircle size={13} /> {couponMessage}
              </motion.div>
            )}
          </div>
        </div>
      </Card>

      {/* Payment Options */}
      {!hasCoupon && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentOptions.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedPayment === option.id;
            return (
              <motion.div key={option.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                <Card
                  className={`p-5 transition-all duration-200 relative reg-select-card ${option.comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={isSelected ? { outline: '2px solid #D97706', outlineOffset: '2px', backgroundColor: '#FFFAF3' } : {}}
                  onClick={() => {
                    if (option.comingSoon) return;
                    setValue('payment.paymentType', option.id as 'full' | 'installment', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                  }}
                >
                  {option.comingSoon && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-bold rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>Coming Soon</span>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${option.color} text-white`}><Icon size={22} /></div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm mb-0.5" style={{ color: '#1F2937' }}>{option.name}</h3>
                      <p className="text-xs mb-2" style={{ color: '#6B7280' }}>{option.description}</p>
                      <input id={`payment-${option.id}`} type="radio" value={option.id} {...register('payment.paymentType')} className="sr-only" disabled={option.comingSoon} />
                      {isSelected && !option.comingSoon && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: '#D97706' }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D97706' }} /> Selected
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

      {/* Free Registration Notice */}
      {couponStatus === 'valid' && (
        <Card className="p-5" style={{ backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 rounded-xl text-white" style={{ backgroundColor: '#15803D' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm mb-0.5" style={{ color: '#14532D' }}>Free Registration Confirmed</h3>
              <p className="text-xs" style={{ color: '#166534' }}>
                Coupon <span className="font-mono font-bold uppercase">{couponCode}</span> applied — no payment required.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
