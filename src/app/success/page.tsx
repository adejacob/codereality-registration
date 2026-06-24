'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Mail, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useState } from 'react';

const SCHEDULE_LABELS: Record<string, string> = {
  weekend:      'Weekend Classes',
  'after-school': 'After-School Classes',
  holiday:      'Holiday Intensive',
  private:      'Private Tutoring',
};

const PAYMENT_LABELS: Record<string, string> = {
  full:         'Full Payment',
  installment:  'Installment Plan',
};

function SuccessContent() {
  const searchParams  = useSearchParams();
  const registrationId = searchParams.get('id')       ?? '';
  const studentName    = searchParams.get('name')     ?? '';
  const programs       = (searchParams.get('programs') ?? '').split(',').filter(Boolean);
  const schedule       = searchParams.get('schedule') ?? '';
  const paymentType    = searchParams.get('payment')  ?? '';
  const coupon         = searchParams.get('coupon')   ?? '';
  const hasCoupon      = coupon.trim() !== '';

  const confettiTriggered = useRef(false);
  const [copied, setCopied] = useState(false);

  const waNumber  = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const waMessage = hasCoupon
    ? encodeURIComponent(
        `Hello Codereality Academy,\n\nI have registered with coupon code ${coupon}.\n\nRegistration ID: ${registrationId}\n\nStudent Name: ${studentName}\n\nThank you.`
      )
    : encodeURIComponent(
        `Hello Codereality Academy,\n\nI have completed payment for registration ID ${registrationId}.\n\nStudent Name: ${studentName}\n\nPlease find my payment confirmation attached.\n\nThank you.`
      );
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`;

  useEffect(() => {
    if (!confettiTriggered.current) {
      confettiTriggered.current = true;
      const duration   = 3500;
      const end        = Date.now() + duration;
      const defaults   = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const rnd        = (min: number, max: number) => Math.random() * (max - min) + min;
      const interval   = setInterval(() => {
        const left = end - Date.now();
        if (left <= 0) return clearInterval(interval);
        const count = 50 * (left / duration);
        confetti({ ...defaults, particleCount: count, origin: { x: rnd(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount: count, origin: { x: rnd(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      return () => clearInterval(interval);
    }
  }, []);

  function copyId() {
    navigator.clipboard.writeText(registrationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const steps = hasCoupon
    ? [
        {
          num: '1',
          color: 'bg-green-500',
          title: 'Registration Confirmed',
          desc: 'Your free registration has been confirmed with coupon code.',
        },
        {
          num: '2',
          color: 'bg-indigo-500',
          title: 'Await Enrollment',
          desc: 'We will process your enrollment and contact you within 24 hours.',
        },
        {
          num: '3',
          color: 'bg-purple-500',
          title: 'Check Your Email',
          desc: 'You will receive orientation details and class schedule shortly.',
        },
      ]
    : [
        {
          num: '1',
          color: 'bg-indigo-500',
          title: 'Complete Payment',
          desc: 'Transfer your program fee using the bank details sent to your email.',
        },
        {
          num: '2',
          color: 'bg-green-500',
          title: 'Send Payment Receipt on WhatsApp',
          desc: 'After paying, tap the WhatsApp button below to send your receipt to us.',
        },
        {
          num: '3',
          color: 'bg-purple-500',
          title: 'Await Enrollment Confirmation',
          desc: 'We will confirm your child\'s enrollment within 24 hours of payment.',
        },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-start justify-center p-4 pt-8 pb-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full space-y-5"
      >
        {/* Logo */}
        <div className="flex justify-center">
          <a href="/" className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-lg shadow-indigo-500/10">
            <Image
              src="/title-logo.jpeg"
              alt="Codereality Academy"
              width={64}
              height={64}
              className="w-full h-full object-cover"
              priority
            />
          </a>
        </div>
        {/* Hero Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 text-center border border-gray-100">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg"
          >
            <CheckCircle className="text-white" size={40} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            Registration Successful! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 text-base"
          >
            Thank you for registering{studentName ? ` ${studentName}` : ''} with Codereality Academy.
            {hasCoupon
              ? ' A confirmation email with enrollment details has been sent to you.'
              : ' A confirmation email with payment details has been sent to you.'}
          </motion.p>
          {hasCoupon && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl"
            >
              <span className="text-base">🎁</span>
              <span>Free registration applied with coupon: <strong className="font-mono uppercase">{coupon}</strong></span>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2.5 rounded-xl"
          >
            <span className="text-base">📬</span>
            <span>Didn&apos;t get the email? <strong>Check your spam/junk folder</strong> and mark it as &quot;Not Spam&quot;</span>
          </motion.div>
        </div>

        {/* Registration ID Card */}
        {registrationId && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-center shadow-lg"
          >
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">Your Registration ID</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-white text-2xl font-black font-mono tracking-wider">{registrationId}</span>
              <button
                onClick={copyId}
                className="text-white/70 hover:text-white transition-colors"
                title="Copy ID"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-white/60 text-xs mt-2">Save this ID — you'll need it for all communications</p>
          </motion.div>
        )}

        {/* Summary */}
        {(programs.length > 0 || schedule || paymentType) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Registration Summary</h2>
            <div className="space-y-3">
              {programs.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Selected Programs</p>
                  <div className="flex flex-wrap gap-2">
                    {programs.map((p) => (
                      <span key={p} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium capitalize">{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {schedule && (
                <div className="flex justify-between items-center py-2 border-t border-gray-50">
                  <span className="text-sm text-gray-500">Schedule</span>
                  <span className="text-sm font-semibold text-gray-800">{SCHEDULE_LABELS[schedule] ?? schedule}</span>
                </div>
              )}
              {paymentType && (
                <div className="flex justify-between items-center py-2 border-t border-gray-50">
                  <span className="text-sm text-gray-500">Payment Plan</span>
                  <span className="text-sm font-semibold text-gray-800">{PAYMENT_LABELS[paymentType] ?? paymentType}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5">Next Steps</h2>
          <div className="space-y-4">
            {steps.map(({ num, color, title, desc }) => (
              <div key={num} className="flex items-start gap-4">
                <div className={`w-8 h-8 ${color} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 shadow`}>
                  {num}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-green-300/40 active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {hasCoupon ? 'Contact Us on WhatsApp' : 'Send Payment Receipt on WhatsApp'}
          </a>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:coderealityacademy.tech@gmail.com"
              className="flex items-center justify-center gap-2 flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Mail size={16} />
              Email Us
            </a>
            <a
              href="https://coderealityacademy.com.ng/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-sm font-semibold"
            >
              Return to Home
              <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
