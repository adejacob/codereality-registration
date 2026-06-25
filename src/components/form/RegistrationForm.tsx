'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { registrationSchema, RegistrationFormData } from '../../lib/validation';
import StepIndicator from './StepIndicator';
import StudentInfoStep from './StudentInfoStep';
import ParentInfoStep from './ParentInfoStep';
import ProgramSelectionStep from './ProgramSelectionStep';
import ScheduleStep from './ScheduleStep';
import PaymentStep, { CouponStatus } from './PaymentStep';
import PricingStep from './PricingStep';
import HolidayPricingStep from './HolidayPricingStep';
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
  const [couponStatus, setCouponStatus] = useState<CouponStatus>('idle');

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
  
  // Watch for schedule to determine which pricing step to show
  const selectedSchedule = watch('schedule.schedule');
  const isHolidayBootcamp = selectedSchedule === 'holiday';

  // Free program IDs fetched once — free programs skip schedule & pricing steps
  const [freeProgramIds, setFreeProgramIds] = useState<string[]>(['workshop']);
  useEffect(() => {
    fetch('/api/programs')
      .then(r => r.json())
      .then(d => { if (d.success) setFreeProgramIds(d.data.filter((p: { isFree: boolean }) => p.isFree).map((p: { id: string }) => p.id)); })
      .catch(() => {});
  }, []);

  const selectedPrograms: string[] = watch('programs.programs') || [];
  const isWorkshopOnly = selectedPrograms.length === 1 && freeProgramIds.includes(selectedPrograms[0]);

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

    // On the Payment step, block navigation if coupon is typed but not yet confirmed valid
    if (currentStep === 4) {
      const couponVal = (methods.getValues('payment.coupon') ?? '').trim();
      if (couponVal && couponStatus !== 'valid') return;
    }

    if (isStepValid) {
      let nextStep = currentStep + 1;
      
      // Workshop: skip Schedule step (3) — go straight to Payment (4)
      if (nextStep === 3 && isWorkshopOnly) {
        nextStep = 4;
      }

      // Skip pricing step if coupon is applied or workshop
      if (nextStep === 5 && (hasCoupon || isWorkshopOnly)) {
        nextStep = 6; // Skip to Review
      }
      
      setCurrentStep(Math.min(nextStep, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    let prevStep = currentStep - 1;
    
    // Skip pricing step when going back if coupon is applied or workshop
    if (prevStep === 5 && (hasCoupon || isWorkshopOnly)) {
      prevStep = 4;
    }

    // Workshop: skip Schedule step when going back from Payment
    if (prevStep === 3 && isWorkshopOnly) {
      prevStep = 2;
    }
    
    setCurrentStep(Math.max(prevStep, 0));
  };

  const handleSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      // Upload photo to Cloudinary if one was selected
      let photoUrl: string | undefined;
      const photoFile = data.student?.photo;
      if (photoFile instanceof File) {
        const fd = new FormData();
        fd.append('file', photoFile);
        const uploadRes = await fetch('/api/upload-photo', { method: 'POST', body: fd });
        const uploadJson = await uploadRes.json();
        if (uploadRes.ok && uploadJson.success) {
          photoUrl = uploadJson.url;
        }
        // If upload fails we continue without photo — not a blocker
      }

      const payload = {
        ...data,
        student: { ...data.student, photo: photoUrl },
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
        return <PaymentStep couponStatus={couponStatus} onCouponStatusChange={setCouponStatus} />;
      case 5:
        return isHolidayBootcamp ? <HolidayPricingStep /> : <PricingStep />;
      case 6:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <section id="registration-form" className={standalone ? 'py-6 pb-20' : 'py-20'} style={{ backgroundColor: '#FCF3E8' }}>
      <div className="container mx-auto px-4">
        {!standalone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: '#1F2937' }}>
              Start Your Journey
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#6B7280' }}>
              Complete the registration form to enroll your child in our STEM programs
            </p>
          </motion.div>
        )}

        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="max-w-[900px] mx-auto">
              <div
                className="bg-white rounded-[20px] p-5 sm:p-8 md:p-10"
                style={{
                  border: '1px solid #E7DCCB',
                  boxShadow: '0 4px 32px rgba(215,119,6,0.10), 0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <StepIndicator steps={steps} currentStep={currentStep} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>

                {submitError && (
                  <div className="mt-6 px-4 py-3 rounded-2xl text-sm font-medium" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                    ⚠️ {submitError}
                  </div>
                )}

                <div className="flex justify-between items-center mt-8 pt-6" style={{ borderTop: '1px solid #E7DCCB' }}>
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ border: '1.5px solid #E7DCCB', color: '#6B7280', backgroundColor: 'transparent' }}
                    onMouseEnter={e => { if (currentStep !== 0) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FDF0DC'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#D97706'; (e.currentTarget as HTMLButtonElement).style.color = '#D97706'; } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E7DCCB'; (e.currentTarget as HTMLButtonElement).style.color = '#6B7280'; }}
                  >
                    ← Previous
                  </button>

                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-3 rounded-2xl font-bold text-sm text-white transition-all duration-200 shadow-md active:scale-95"
                      style={{ backgroundColor: '#D97706', boxShadow: '0 4px 14px rgba(217,119,6,0.35)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#B45309'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#D97706'; }}
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={methods.handleSubmit(handleSubmit)}
                      className="px-8 py-3 rounded-2xl font-bold text-sm text-white transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      style={{ backgroundColor: '#15803D', boxShadow: '0 4px 14px rgba(21,128,61,0.30)' }}
                      onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#166534'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#15803D'; }}
                    >
                      {isSubmitting ? 'Submitting…' : '✓ Confirm & Submit'}
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
