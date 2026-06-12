'use client';

import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Tag, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';

const paymentOptions = [
  { id: 'full', name: 'Full Payment', description: 'Pay the complete amount upfront', icon: CreditCard, color: 'from-green-500 to-emerald-500', comingSoon: false },
  { id: 'installment', name: 'Installment Plan', description: 'Pay in convenient monthly installments', icon: Calendar, color: 'from-blue-500 to-indigo-500', comingSoon: true },
];

export default function PaymentStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const selectedPayment = watch('payment.paymentType');
  const couponCode = watch('payment.coupon') || '';
  const hasCoupon = couponCode.trim() !== '';

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
      <Card className="p-6 mb-6 border-amber-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <Tag size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Have a Coupon Code?
            </h3>
            <input
              type="text"
              placeholder="Enter coupon code (optional)"
              {...register('payment.coupon', {
                onChange: (e) => {
                  const value = e.target.value;
                  if (value.trim()) {
                    // Clear payment selection when coupon is entered
                    setValue('payment.paymentType', undefined);
                  }
                }
              })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-mono uppercase"
            />
            {hasCoupon && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-3 text-green-600 text-sm"
              >
                <CheckCircle size={16} />
                <span>Coupon applied - Payment not required</span>
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
                  const radio = document.getElementById(`payment-${option.id}`) as HTMLInputElement;
                  radio.click();
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

      {/* Free Registration Notice - Show when coupon is used */}
      {hasCoupon && (
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
