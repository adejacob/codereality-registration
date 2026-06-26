import type { Metadata } from 'next';
import Image from 'next/image';
import RegistrationForm from '@/components/form/RegistrationForm';

export const metadata: Metadata = {
  title: 'Register Your Child – Codereality Academy',
  description: 'Enroll your child in our world-class STEM programs. Fill in the registration form to get started.',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen reg-light-scheme" style={{ backgroundColor: '#FCF3E8' }}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20 px-4 py-3.5" style={{ borderColor: '#E7DCCB', boxShadow: '0 1px 12px rgba(215,119,6,0.08)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md" style={{ boxShadow: '0 2px 8px rgba(215,119,6,0.2)' }}>
              <Image
                src="/title-logo.jpeg"
                alt="Codereality Academy"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="leading-tight">
              <p className="font-black text-sm tracking-tight" style={{ color: '#1F2937' }}>Codereality</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#D97706' }}>Academy</p>
            </div>
          </a>
          <a
            href="/"
            className="text-sm font-semibold flex items-center gap-1.5 transition-colors hover:opacity-70"
            style={{ color: '#6B7280' }}
          >
            ← Back to Home
          </a>
        </div>
      </header>

      {/* Page hero */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ backgroundColor: '#D97706', color: '#fff' }}>
          Enrolment Form
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3" style={{ color: '#1F2937' }}>
          Register Your Child
        </h1>
        <p className="text-base max-w-md mx-auto" style={{ color: '#6B7280' }}>
          Complete the steps below to secure your child&apos;s spot in our STEM programs.
        </p>
      </div>

      <RegistrationForm standalone />
    </main>
  );
}
