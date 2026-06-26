'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Clock, CheckCircle, UserCheck, XCircle, PhoneCall,
  TrendingUp, ArrowRight, CreditCard, BadgeCheck, AlertCircle,
  Lock, X, Eye, EyeOff, Loader2, Tag, ToggleLeft, ToggleRight, Settings,
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
  label, value, icon: Icon, gradient, delay, note,
}: {
  label: string; value: number | undefined; icon: React.ComponentType<{ size?: number; className?: string }>;
  gradient: string; delay: number; note?: string; accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-200"
      style={{ border: '1px solid #E7DCCB', boxShadow: '0 2px 12px rgba(215,119,6,0.07)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon size={18} className="text-white" />
        </div>
        {note && (
          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>{note}</span>
        )}
      </div>
      <p className="text-3xl font-black tabular-nums" style={{ color: '#1F2937' }}>{value ?? 0}</p>
      <p className="text-[11px] font-bold uppercase tracking-wider mt-1" style={{ color: '#9CA3AF' }}>{label}</p>
    </motion.div>
  );
}

function MiniBar({ pct, color, label }: { pct: number; color: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: '#6B7280' }}>{label}</span>
        <span className="font-bold" style={{ color: '#1F2937' }}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E7DCCB' }}>
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

  const pwInputClass = "w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all";
  const pwInputStyle = { borderColor: '#E7DCCB', color: '#1F2937' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl w-full max-w-md p-6"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid #E7DCCB' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-lg flex items-center gap-2" style={{ color: '#1F2937' }}>
            <Lock size={18} style={{ color: '#D97706' }} />
            Change Password
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9CA3AF' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[{ label: 'Current Password', value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
            { label: 'New Password', value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew), hint: 'Must be at least 8 characters' },
            { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
          ].map(({ label, value, set, show, toggle, hint }) => (
            <div key={label}>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1F2937' }}>{label}</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={value} onChange={e => set(e.target.value)} required minLength={label === 'New Password' ? 8 : undefined} className={pwInputClass} style={pwInputStyle} />
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              {hint && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{hint}</p>}
            </div>
          ))}

          {error && <p className="text-sm rounded-xl px-3 py-2" style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>{error}</p>}
          {success && <p className="text-sm rounded-xl px-3 py-2" style={{ backgroundColor: '#F0FDF4', color: '#15803D', border: '1px solid #86EFAC' }}>{success}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: '#D97706', boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            {loading ? 'Changing…' : 'Change Password'}
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
  const [installmentEnabled, setInstallmentEnabled] = useState(false);
  const [installmentSaving, setInstallmentSaving]   = useState(false);

  useEffect(() => {
    fetch('/api/admin/registrations?limit=6')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { setStats(d.stats); setRecent(d.data); }
      })
      .finally(() => setLoading(false));

    fetch('/api/admin/settings?key=installment_enabled')
      .then(r => r.json())
      .then(d => { if (d.success) setInstallmentEnabled(d.value === 'true'); })
      .catch(() => {});
  }, []);

  async function toggleInstallment() {
    const newValue = !installmentEnabled;
    setInstallmentSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'installment_enabled', value: String(newValue) }),
      });
      const data = await res.json();
      if (data.success) setInstallmentEnabled(newValue);
    } catch { /* silent */ } finally {
      setInstallmentSaving(false);
    }
  }

  const conversionRate = stats && stats.total > 0
    ? ((stats.enrolled / stats.total) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Welcome back — here&apos;s your academy overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChangePassword(true)}
            className="flex items-center gap-2 text-xs font-semibold bg-white rounded-xl px-3 py-2 transition-all"
            style={{ border: '1px solid #E7DCCB', color: '#6B7280', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#D97706'; (e.currentTarget as HTMLButtonElement).style.color = '#D97706'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E7DCCB'; (e.currentTarget as HTMLButtonElement).style.color = '#6B7280'; }}
          >
            <Lock size={14} /> Change Password
          </button>
          <div className="flex items-center gap-2 text-xs bg-white rounded-xl px-3 py-2 w-fit" style={{ border: '1px solid #E7DCCB', color: '#9CA3AF' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#15803D' }} />
            Live data
          </div>
        </div>
      </div>

      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

      {/* Site Settings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-5"
        style={{ border: '1px solid #E7DCCB', boxShadow: '0 2px 12px rgba(215,119,6,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings size={15} style={{ color: '#D97706' }} />
          <h2 className="font-bold text-sm" style={{ color: '#1F2937' }}>Site Settings</h2>
        </div>
        <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ backgroundColor: '#FFFAF3', border: '1px solid #E7DCCB' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>Installment Plan</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Allow registrants to select the installment payment option</p>
          </div>
          <button
            onClick={toggleInstallment}
            disabled={installmentSaving}
            className="flex items-center gap-2 transition-all"
            style={{ color: installmentEnabled ? '#15803D' : '#9CA3AF' }}
          >
            {installmentSaving
              ? <Loader2 size={28} className="animate-spin" style={{ color: '#D97706' }} />
              : installmentEnabled
              ? <ToggleRight size={36} />
              : <ToggleLeft size={36} />
            }
            <span className="text-xs font-bold">{installmentEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </motion.div>

      {/* Registration Stats */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[2px] mb-3" style={{ color: '#D97706' }}>Registration Pipeline</p>
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
        <p className="text-[11px] font-bold uppercase tracking-[2px] mb-3" style={{ color: '#D97706' }}>Payment Overview</p>
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
            className="bg-white rounded-2xl p-6"
            style={{ border: '1px solid #E7DCCB', boxShadow: '0 2px 12px rgba(215,119,6,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={15} style={{ color: '#D97706' }} />
              <h2 className="font-bold text-sm" style={{ color: '#1F2937' }}>Registration Pipeline</h2>
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
            className="bg-white rounded-2xl p-6"
            style={{ border: '1px solid #E7DCCB', boxShadow: '0 2px 12px rgba(215,119,6,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={15} style={{ color: '#15803D' }} />
              <h2 className="font-bold text-sm" style={{ color: '#1F2937' }}>Payment Overview</h2>
            </div>
            <div className="space-y-3 mb-5">
              <MiniBar pct={(stats.pendingPayment   / stats.total) * 100} color="bg-orange-400" label="Pending Payment"   />
              <MiniBar pct={(stats.paymentSubmitted / stats.total) * 100} color="bg-blue-400"   label="Payment Submitted" />
              <MiniBar pct={(stats.paymentConfirmed / stats.total) * 100} color="bg-green-500"  label="Payment Confirmed" />
              <MiniBar pct={(stats.couponRegistrations / stats.total) * 100} color="bg-purple-400" label="Coupon Used" />
            </div>
            <div className="pt-4 flex items-center justify-between" style={{ borderTop: '1px solid #E7DCCB' }}>
              <span className="text-sm" style={{ color: '#6B7280' }}>Enrollment Conversion Rate</span>
              <span className="text-2xl font-black" style={{ color: '#D97706' }}>{conversionRate}%</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Recent registrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid #E7DCCB', boxShadow: '0 2px 12px rgba(215,119,6,0.07)' }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #E7DCCB' }}>
          <h2 className="font-black text-sm" style={{ color: '#1F2937' }}>Recent Registrations</h2>
          <Link href="/admin/registrations" className="text-xs font-bold flex items-center gap-1 transition-colors" style={{ color: '#D97706' }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: '#F3E8D4' }} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#9CA3AF' }}>
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No registrations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-bold uppercase tracking-wider" style={{ backgroundColor: '#FFFAF3', borderBottom: '1px solid #E7DCCB' }}>
                  <th className="px-6 py-3" style={{ color: '#9CA3AF' }}>Student</th>
                  <th className="px-6 py-3 hidden md:table-cell" style={{ color: '#9CA3AF' }}>Programs</th>
                  <th className="px-6 py-3" style={{ color: '#9CA3AF' }}>Status</th>
                  <th className="px-6 py-3 hidden lg:table-cell" style={{ color: '#9CA3AF' }}>Payment</th>
                  <th className="px-6 py-3 hidden xl:table-cell" style={{ color: '#9CA3AF' }}>Enrolled</th>
                  <th className="px-6 py-3 hidden lg:table-cell" style={{ color: '#9CA3AF' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r._id} className="transition-colors" style={{ borderBottom: '1px solid #F9F0E3' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#FFFAF3'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'; }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold" style={{ color: '#1F2937' }}>{r.student.firstName} {r.student.lastName}</p>
                      <p className="text-xs font-mono" style={{ color: '#9CA3AF' }}>{r.registrationId}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {r.programs.programs.slice(0, 2).map((p) => (
                          <span key={p} className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>{p}</span>
                        ))}
                        {r.programs.programs.length > 2 && (
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>+{r.programs.programs.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${paymentColors[r.paymentStatus] ?? 'bg-gray-100 text-gray-700'}`}>
                        {paymentLabels[r.paymentStatus] ?? r.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      {r.enrollmentNumber
                        ? <span className="font-mono text-xs font-bold" style={{ color: '#D97706' }}>{r.enrollmentNumber}</span>
                        : <span className="text-xs" style={{ color: '#D1D5DB' }}>—</span>}
                    </td>
                    <td className="px-6 py-4 text-xs hidden lg:table-cell" style={{ color: '#9CA3AF' }}>
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
