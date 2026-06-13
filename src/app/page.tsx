import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense } from 'react';

// Static imports for above-fold content
import Hero from '@/components/sections/Hero';

// Dynamic imports for below-fold content (reduces initial bundle)
const Statistics = dynamic(() => import('@/components/sections/Statistics'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse" />,
});

const WhyChooseUs = dynamic(() => import('@/components/sections/WhyChooseUs'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
});

const Testimonials = dynamic(() => import('@/components/sections/Testimonials'), {
  loading: () => <div className="h-80 bg-gray-100 animate-pulse" />,
});

const FAQ = dynamic(() => import('@/components/sections/FAQ'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse" />,
});

const TrustBadges = dynamic(() => import('@/components/sections/TrustBadges'), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse" />,
});

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
        <Statistics />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse" />}>
        <WhyChooseUs />
      </Suspense>
      <Suspense fallback={<div className="h-80 bg-gray-100 animate-pulse" />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
        <FAQ />
      </Suspense>
      <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
        <TrustBadges />
      </Suspense>

      {/* Register CTA section */}
      <section id="register" className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-3">Limited Spots Available</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
            Ready to Enroll<br className="hidden sm:block" /> Your Child?
          </h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            Secure your child&apos;s spot in our world-class STEM programs today. Registration takes less than 5 minutes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-black text-lg px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            Register Now →
          </Link>
          <p className="text-indigo-300/60 text-xs mt-4">No payment required to register</p>
        </div>
      </section>
    </main>
  );
}
