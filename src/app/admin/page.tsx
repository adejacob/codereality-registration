'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Clock, CheckCircle, UserCheck, XCircle, PhoneCall,
  TrendingUp, ArrowRight, CreditCard, BadgeCheck, AlertCircle,
  Lock, X, Eye, EyeOff, Loader2, Tag,
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  total: number;
  pending: number;
  contacted: number;
  approved: number;
  enrolled: number;
  rejected: number;
  pendingPayment: number;
  paymentSubmitted: number;
  paymentConfirmed: number;
  couponRegistrations: number;
}

interface Registration {
  _id: string;
  registrationId: string;
  status: string;
  paymentStatus: string;
  enrollmentNumber?: string;
  student: { firstName: string; lastName: string; schoolName: string };
  parent: { email: string };
  programs: { programs: string[] };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  contacted: 'bg-blue-100 text-blue-700',
  approved:  'bg-emerald-100 text-emerald-700',
  enrolled:  'bg-violet-100 text-violet-700',
  rejected:  'bg-red-100 text-red-700',
};

const paymentColors: Record<string, string> = {
  pending_payment:   'bg-orange-100 text-orange-700',
  payment_submitted: 'bg-blue-100 text-blue-700',
  payment_confirmed: 'bg-green-100 text-green-700',
};

const paymentLabels: Record<string, string> = {
  pending_payment:   'Pending Payment',
  payment_submitted: 'Submitted',
  payment_confirmed: 'Confirmed',
};

function StatCard({
  label, value, icon: Icon, gradient, delay, note, accent,
}: {
  label: string; value: number | undefined; icon: React.ComponentType<{ size?: number; className?: string }>;
  gradient: string; delay: number; note?: string; accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-md`}>
          <Icon size={20} className="text-white" />
        </div>
        {note && (
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">{note}</span>
        )}
      </div>
      <p className={`text-3xl font-black ${accent ?? 'text-gray-900'} tabular-nums`}>{value ?? 0}</p>
      <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
    </motion.div>
  );
}

function MiniBar({ pct, color, label }: { pct: number; color: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span className="font-semibold">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => onClose(), 1500);
      } else {
        setError(data.message ?? 'Failed to change password');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Change Admin Password
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [recent, setRecent]   = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    fetch('/api/admin/registrations?limit=6')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { setStats(d.stats); setRecent(d.data); }
      })
      .finally(() => setLoading(false));
  }, []);

  const conversionRate = stats && stats.total > 0
    ? ((stats.enrolled / stats.total) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back — here&apos;s your academy overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChangePassword(true)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-gray-100 hover:border-indigo-200 hover:text-indigo-600 rounded-xl px-3 py-2 shadow-sm transition-all"
          >
            <Lock size={14} />
            Change Password
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm w-fit">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live data
          </div>
        </div>
      </div>

      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

      {/* Registration Stats */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px] mb-3">Registration Pipeline</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
          <StatCard label="Total"     value={stats?.total}     icon={Users}       gradient="from-indigo-500 to-purple-600" delay={0.05} accent="text-indigo-700" />
          <StatCard label="Pending"   value={stats?.pending}   icon={Clock}       gradient="from-amber-400 to-orange-500"  delay={0.10} accent="text-amber-700" />
          <StatCard label="Contacted" value={stats?.contacted} icon={PhoneCall}   gradient="from-blue-400 to-cyan-500"     delay={0.15} accent="text-blue-700" />
          <StatCard label="Approved"  value={stats?.approved}  icon={CheckCircle} gradient="from-emerald-400 to-green-500" delay={0.20} accent="text-emerald-700" />
          <StatCard label="Enrolled"  value={stats?.enrolled}  icon={UserCheck}   gradient="from-violet-400 to-purple-500" delay={0.25} accent="text-violet-700" />
          <StatCard label="Rejected"  value={stats?.rejected}  icon={XCircle}     gradient="from-red-400 to-rose-500"      delay={0.30} accent="text-red-700" />
          <StatCard label="Coupon"    value={stats?.couponRegistrations} icon={Tag} gradient="from-purple-500 to-violet-600" delay={0.35} accent="text-purple-700" />
        </div>
      </div>

      {/* Payment Stats */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px] mb-3">Payment Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Pending Payment"   value={stats?.pendingPayment}   icon={AlertCircle}  gradient="from-orange-400 to-amber-500"  delay={0.35} note="Awaiting" accent="text-orange-700" />
          <StatCard label="Payment Submitted"  value={stats?.paymentSubmitted} icon={CreditCard}   gradient="from-blue-400 to-indigo-500"   delay={0.40} note="Verify"   accent="text-blue-700" />
          <StatCard label="Payment Confirmed"  value={stats?.paymentConfirmed} icon={BadgeCheck}   gradient="from-green-500 to-emerald-600" delay={0.45} note="Ready"    accent="text-green-700" />
        </div>
      </div>

      {/* Charts row */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Enrollment funnel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} className="text-indigo-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Registration Pipeline</h2>
            </div>
            <div className="space-y-3">
              <MiniBar pct={(stats.pending   / stats.total) * 100} color="bg-amber-400"   label="Pending"   />
              <MiniBar pct={(stats.contacted / stats.total) * 100} color="bg-blue-400"    label="Contacted" />
              <MiniBar pct={(stats.approved  / stats.total) * 100} color="bg-emerald-400" label="Approved"  />
              <MiniBar pct={(stats.enrolled  / stats.total) * 100} color="bg-violet-500"  label="Enrolled"  />
              <MiniBar pct={(stats.rejected  / stats.total) * 100} color="bg-red-400"     label="Rejected"  />
              <MiniBar pct={(stats.couponRegistrations / stats.total) * 100} color="bg-purple-400" label="Coupon Registrations" />
            </div>
          </motion.div>

          {/* Payment overview + conversion */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={16} className="text-green-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Payment Overview</h2>
            </div>
            <div className="space-y-3 mb-5">
              <MiniBar pct={(stats.pendingPayment   / stats.total) * 100} color="bg-orange-400" label="Pending Payment"   />
              <MiniBar pct={(stats.paymentSubmitted / stats.total) * 100} color="bg-blue-400"   label="Payment Submitted" />
              <MiniBar pct={(stats.paymentConfirmed / stats.total) * 100} color="bg-green-500"  label="Payment Confirmed" />
              <MiniBar pct={(stats.couponRegistrations / stats.total) * 100} color="bg-purple-400" label="Coupon Used" />
            </div>
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Enrollment Conversion Rate</span>
              <span className="text-2xl font-black text-violet-600">{conversionRate}%</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Recent registrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Registrations</h2>
          <Link href="/admin/registrations" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No registrations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 font-semibold">Student</th>
                  <th className="px-6 py-3 font-semibold hidden md:table-cell">Programs</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold hidden lg:table-cell">Payment</th>
                  <th className="px-6 py-3 font-semibold hidden xl:table-cell">Enrolled</th>
                  <th className="px-6 py-3 font-semibold hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{r.student.firstName} {r.student.lastName}</p>
                      <p className="text-xs text-gray-400 font-mono">{r.registrationId}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {r.programs.programs.slice(0, 2).map((p) => (
                          <span key={p} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs capitalize">{p}</span>
                        ))}
                        {r.programs.programs.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">+{r.programs.programs.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentColors[r.paymentStatus] ?? 'bg-gray-100 text-gray-700'}`}>
                        {paymentLabels[r.paymentStatus] ?? r.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      {r.enrollmentNumber
                        ? <span className="font-mono text-xs text-violet-700 font-semibold">{r.enrollmentNumber}</span>
                        : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs hidden lg:table-cell">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
