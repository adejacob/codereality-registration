'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/admin';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(redirect);
      } else {
        setError(data.message ?? 'Invalid password');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FCF3E8' }}>
      {/* Subtle warm blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ backgroundColor: '#D97706', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: '#C2410C', filter: 'blur(80px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-[20px] p-8" style={{ border: '1px solid #E7DCCB', boxShadow: '0 8px 40px rgba(215,119,6,0.12), 0 2px 8px rgba(0,0,0,0.04)' }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white" style={{ boxShadow: '0 4px 16px rgba(215,119,6,0.25)', border: '2px solid #E7DCCB' }}>
                <Image
                  src="/title-logo.jpeg"
                  alt="Codereality Academy"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: '#D97706', color: '#fff' }}>
                Admin Portal
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Welcome Back</h1>
            <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Sign in to the Codereality Academy admin panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1F2937' }}>Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: '#D97706' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full pl-10 pr-12 py-3.5 rounded-2xl border bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all"
                  style={{ borderColor: '#E7DCCB', color: '#1F2937' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#9CA3AF' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl px-4 py-3 text-sm font-medium"
                style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
              style={{ backgroundColor: '#D97706', boxShadow: '0 4px 14px rgba(217,119,6,0.35)' }}
              onMouseEnter={e => { if (!loading && password) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#B45309'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#D97706'; }}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : 'Sign In →'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
