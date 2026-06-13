'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { registrationSchema, RegistrationFormData } from '../../lib/validation';
import StepIndicator from './StepIndicator';
import StudentInfoStep from './StudentInfoStep';
import ParentInfoStep from './ParentInfoStep';
import ProgramSelectionStep from './ProgramSelectionStep';
import ScheduleStep from './ScheduleStep';
import PaymentStep from './PaymentStep';
import PricingStep from './PricingStep';
import ReviewStep from './ReviewStep';

const steps = [
  'Student Info',
  'Parent Info',
  'Programs',
  'Schedule',
  'Payment',
  'Pricing',
  'Review',
];

export default function RegistrationForm({ standalone = false }: { standalone?: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const methods = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      student: {
        firstName: '',
        lastName: '',
        gender: undefined,
        dateOfBirth: '',
        schoolName: '',
        classGrade: '',
      },
      parent: {
        fullName: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        occupation: '',
      },
      programs: {
        programs: [],
      },
      schedule: {
        schedule: undefined,
      },
      payment: {
        paymentType: undefined,
        coupon: '',
      },
    },
  });

  const { trigger, formState: { isValid }, watch } = methods;
  
  // Watch for coupon to conditionally skip pricing step
  const coupon = watch('payment.coupon');
  const hasCoupon = coupon && coupon.trim() !== '';

  const handleNext = async () => {
    const fieldsToValidate = [
      ['student'],
      ['parent'],
      ['programs'],
      ['schedule'],
      ['payment.paymentType', 'payment.coupon'], // Payment step - validate specific fields
      ['payment.selectedPlan'], // Pricing step - validate plan selection
      [], // Review step
    ];

    const isStepValid = await trigger(fieldsToValidate[currentStep] as any);
    if (isStepValid) {
      let nextStep = currentStep + 1;
      
      // Skip pricing step if coupon is applied
      if (nextStep === 5 && hasCoupon) {
        nextStep = 6; // Skip to Review
      }
      
      setCurrentStep(Math.min(nextStep, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    let prevStep = currentStep - 1;
    
    // Skip pricing step when going back if coupon is applied
    if (prevStep === 5 && hasCoupon) {
      prevStep = 4; // Go back to Payment
    }
    
    setCurrentStep(Math.max(prevStep, 0));
  };

  const handleSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      // Strip the photo FileList — it cannot be JSON-serialised or stored as a string
      const payload = {
        ...data,
        student: { ...data.student, photo: undefined },
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const params = new URLSearchParams({
          id:       result.registrationId,
          name:     result.studentName     ?? '',
          programs: (result.programs ?? []).join(','),
          schedule: result.schedule        ?? '',
          payment:  result.paymentType     ?? '',
        });
        // Add coupon to URL if present
        if (result.coupon) {
          params.set('coupon', result.coupon);
        }
        window.location.href = `/success?${params.toString()}`;
      } else {
        setSubmitError(result.message ?? 'Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StudentInfoStep />;
      case 1:
        return <ParentInfoStep />;
      case 2:
        return <ProgramSelectionStep />;
      case 3:
        return <ScheduleStep />;
      case 4:
        return <PaymentStep />;
      case 5:
        return <PricingStep />;
      case 6:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <section id="registration-form" className={standalone ? 'py-6 pb-16' : 'py-20 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800'}>
      <div className="container mx-auto px-4">
        {!standalone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Start Your Journey
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Complete the registration form to enroll your child in our STEM programs
            </p>
          </motion.div>
        )}

        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-5 sm:p-8 md:p-12 border border-gray-100 dark:border-gray-700">
                <StepIndicator steps={steps} currentStep={currentStep} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>

                {submitError && (
                  <div className="mt-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                    ⚠️ {submitError}
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    Previous
                  </button>

                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg shadow-indigo-500/30"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={methods.handleSubmit(handleSubmit)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all font-semibold shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Confirm & Submit Registration'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </section>
  );
}
