import type { Metadata } from 'next';
import RegistrationForm from '@/components/form/RegistrationForm';

export const metadata: Metadata = {
  title: 'Register Your Child – Codereality Academy',
  description: 'Enroll your child in our world-class STEM programs. Fill in the registration form to get started.',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow">
              CR
            </div>
            <div className="leading-tight">
              <p className="font-black text-gray-900 text-sm tracking-tight">Codereality</p>
              <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-widest">Academy</p>
            </div>
          </a>
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </header>

      {/* Page title */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-2 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Register Your Child
        </h1>
        <p className="text-gray-500 mt-2 text-base max-w-lg mx-auto">
          Complete the steps below to secure your child&apos;s spot in our STEM programs.
        </p>
      </div>

      {/* Form — no extra marketing content */}
      <RegistrationForm standalone />
    </main>
  );
}
