'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, ToggleLeft, ToggleRight, Tag, Percent, DollarSign,
  Calendar, Users, Loader2, AlertCircle, X, ChevronDown, ChevronUp,
  UserX,
} from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
}

interface CouponStudent {
  _id: string;
  registrationId: string;
  student: { firstName: string; lastName: string };
  parent: { email: string };
  createdAt: string;
  status: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCoupon, setExpandedCoupon] = useState<string | null>(null);
  const [couponStudents, setCouponStudents] = useState<Record<string, CouponStudent[]>>({});
  const [loadingStudents, setLoadingStudents] = useState<string | null>(null);
  const [removingStudent, setRemovingStudent] = useState<string | null>(null);
  
  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    usageLimit: '',
    expiresAt: '',
  });

  // Toggle state
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data);
      } else {
        setError(data.message || 'Failed to load coupons');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coupons - check console');
      console.error('Fetch coupons error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCoupon.code.trim(),
          description: newCoupon.description.trim(),
          discountType: newCoupon.discountType,
          discountValue: Number(newCoupon.discountValue),
          isActive: true,
          usageLimit: newCoupon.usageLimit ? Number(newCoupon.usageLimit) : null,
          expiresAt: newCoupon.expiresAt || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCoupons([data.data, ...coupons]);
        setShowCreateModal(false);
        setNewCoupon({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: '',
          usageLimit: '',
          expiresAt: '',
        });
      } else {
        setCreateError(data.message || 'Failed to create coupon');
      }
    } catch {
      setCreateError('Failed to create coupon');
    } finally {
      setCreating(false);
    }
  }

  async function toggleCoupon(id: string, currentStatus: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setCoupons(coupons.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
      }
    } catch {
      // Silent fail - don't show error for toggle
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteCoupon(id: string) {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setCoupons(coupons.filter(c => c._id !== id));
      }
    } catch {
      alert('Failed to delete coupon');
    } finally {
      setDeletingId(null);
    }
  }

  async function fetchCouponStudents(code: string) {
    if (couponStudents[code]) {
      setExpandedCoupon(expandedCoupon === code ? null : code);
      return;
    }
    setLoadingStudents(code);
    setExpandedCoupon(code);
    try {
      const res = await fetch(`/api/admin/registrations?coupon=${encodeURIComponent(code)}&limit=100`);
      const data = await res.json();
      if (data.success) {
        setCouponStudents(prev => ({ ...prev, [code]: data.data }));
      }
    } catch {
      /* silent */
    } finally {
      setLoadingStudents(null);
    }
  }

  async function removeStudentFromCoupon(regId: string, couponCode: string) {
    if (!confirm('Remove this student from the coupon? This clears their coupon code from the registration.')) return;
    setRemovingStudent(regId);
    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'payment.coupon': '' }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponStudents(prev => ({
          ...prev,
          [couponCode]: (prev[couponCode] ?? []).filter(s => s._id !== regId),
        }));
        setCoupons(prev => prev.map(c =>
          c.code === couponCode ? { ...c, usedCount: Math.max(0, c.usedCount - 1) } : c
        ));
      }
    } catch {
      alert('Failed to remove student from coupon');
    } finally {
      setRemovingStudent(null);
    }
  }

  function formatDiscount(type: string, value: number) {
    if (type === 'percentage') {
      return `${value}% OFF`;
    }
    return `₦${value.toLocaleString()} OFF`;
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const activeCoupons = coupons.filter(c => c.isActive);
  const inactiveCoupons = coupons.filter(c => !c.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Coupon Codes</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Create and manage discount coupons for registrations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          style={{ backgroundColor: '#D97706', boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Coupons', value: coupons.length, color: '#1F2937' },
          { label: 'Active', value: activeCoupons.length, color: '#15803D' },
          { label: 'Inactive', value: inactiveCoupons.length, color: '#6B7280' },
          { label: 'Total Uses', value: coupons.reduce((sum, c) => sum + c.usedCount, 0), color: '#D97706' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E7DCCB', boxShadow: '0 2px 8px rgba(215,119,6,0.06)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{label}</p>
            <p className="text-2xl font-black mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin" size={28} style={{ color: '#D97706' }} />
        </div>
      ) : (
        <>
          {/* Active Coupons */}
          {activeCoupons.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-[11px] font-bold uppercase tracking-[2px]" style={{ color: '#D97706' }}>
                Active ({activeCoupons.length})
              </h2>
              <div className="grid gap-3">
                {activeCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon._id}
                    coupon={coupon}
                    onToggle={() => toggleCoupon(coupon._id, coupon.isActive)}
                    onDelete={() => deleteCoupon(coupon._id)}
                    isToggling={togglingId === coupon._id}
                    isDeleting={deletingId === coupon._id}
                    onViewStudents={() => fetchCouponStudents(coupon.code)}
                    isExpanded={expandedCoupon === coupon.code}
                    students={couponStudents[coupon.code]}
                    loadingStudents={loadingStudents === coupon.code}
                    onRemoveStudent={(regId) => removeStudentFromCoupon(regId, coupon.code)}
                    removingStudent={removingStudent}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Coupons */}
          {inactiveCoupons.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-[11px] font-bold uppercase tracking-[2px]" style={{ color: '#9CA3AF' }}>
                Inactive ({inactiveCoupons.length})
              </h2>
              <div className="grid gap-3">
                {inactiveCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon._id}
                    coupon={coupon}
                    onToggle={() => toggleCoupon(coupon._id, coupon.isActive)}
                    onDelete={() => deleteCoupon(coupon._id)}
                    isToggling={togglingId === coupon._id}
                    isDeleting={deletingId === coupon._id}
                    isInactive
                    onViewStudents={() => fetchCouponStudents(coupon.code)}
                    isExpanded={expandedCoupon === coupon.code}
                    students={couponStudents[coupon.code]}
                    loadingStudents={loadingStudents === coupon.code}
                    onRemoveStudent={(regId) => removeStudentFromCoupon(regId, coupon.code)}
                    removingStudent={removingStudent}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {coupons.length === 0 && !loading && (
            <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '2px dashed #E7DCCB' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FEF3C7' }}>
                <Tag size={24} style={{ color: '#D97706' }} />
              </div>
              <h3 className="font-black text-base" style={{ color: '#1F2937' }}>No coupons yet</h3>
              <p className="text-sm mt-1 mb-4" style={{ color: '#6B7280' }}>Create your first coupon to offer discounts</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold text-sm transition-all"
                style={{ backgroundColor: '#D97706' }}
              >
                <Plus size={15} /> Create Coupon
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            style={{ border: '1px solid #E7DCCB', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
          >
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E7DCCB', backgroundColor: '#FFFAF3' }}>
              <h2 className="font-black text-base" style={{ color: '#1F2937' }}>Create New Coupon</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9CA3AF' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createCoupon} className="p-5 space-y-4">
              {createError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                  <AlertCircle size={14} /> {createError}
                </div>
              )}

              {/* shared input styles */}
              {[null].map(() => {
                const iClass = "w-full px-3 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all";
                const iStyle = { borderColor: '#E7DCCB', color: '#1F2937' };
                const lClass = "block text-xs font-bold mb-1.5";
                const lStyle = { color: '#1F2937' };
                const hStyle = { color: '#9CA3AF', fontSize: '11px', marginTop: '4px' };
                return (
                  <>
                    <div>
                      <label className={lClass} style={lStyle}>Coupon Code *</label>
                      <input type="text" required maxLength={20} value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., FREE2024" className={iClass + ' font-mono uppercase'} style={iStyle} />
                      <p style={hStyle}>Letters, numbers, hyphens, underscores only</p>
                    </div>
                    <div>
                      <label className={lClass} style={lStyle}>Description</label>
                      <input type="text" value={newCoupon.description}
                        onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                        placeholder="e.g., Free registration for promo" className={iClass} style={iStyle} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lClass} style={lStyle}>Discount Type *</label>
                        <select value={newCoupon.discountType}
                          onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as 'percentage' | 'fixed' })}
                          className={iClass} style={iStyle}>
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₦)</option>
                        </select>
                      </div>
                      <div>
                        <label className={lClass} style={lStyle}>Discount Value *</label>
                        <input type="number" required min={0} max={newCoupon.discountType === 'percentage' ? 100 : 999999}
                          value={newCoupon.discountValue}
                          onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                          placeholder={newCoupon.discountType === 'percentage' ? '100' : '5000'}
                          className={iClass} style={iStyle} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lClass} style={lStyle}>Usage Limit</label>
                        <input type="number" min={1} value={newCoupon.usageLimit}
                          onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                          placeholder="Unlimited" className={iClass} style={iStyle} />
                        <p style={hStyle}>Leave empty for unlimited</p>
                      </div>
                      <div>
                        <label className={lClass} style={lStyle}>Expiry Date</label>
                        <input type="date" value={newCoupon.expiresAt}
                          onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                          className={iClass} style={iStyle} />
                        <p style={hStyle}>Leave empty for no expiry</p>
                      </div>
                    </div>
                  </>
                );
              })}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
                  style={{ border: '1px solid #E7DCCB', color: '#6B7280' }}>
                  Cancel
                </button>
                <button type="submit" disabled={creating || !newCoupon.code || !newCoupon.discountValue}
                  className="flex-1 px-4 py-2.5 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: '#D97706' }}>
                  {creating && <Loader2 size={14} className="animate-spin" />}
                  {creating ? 'Creating…' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Coupon Card Component
function CouponCard({
  coupon,
  onToggle,
  onDelete,
  isToggling,
  isDeleting,
  isInactive,
  onViewStudents,
  isExpanded,
  students,
  loadingStudents,
  onRemoveStudent,
  removingStudent,
}: {
  coupon: Coupon;
  onToggle: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDeleting: boolean;
  isInactive?: boolean;
  onViewStudents: () => void;
  isExpanded: boolean;
  students?: CouponStudent[];
  loadingStudents: boolean;
  onRemoveStudent: (regId: string) => void;
  removingStudent: string | null;
}) {
  const isExpired = coupon.expiresAt && new Date() > new Date(coupon.expiresAt);
  const isLimitReached = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;

  return (
    <div
      className="bg-white rounded-2xl transition-all"
      style={{ border: `1px solid ${isInactive ? '#E5E7EB' : '#E7DCCB'}`, opacity: isInactive ? 0.75 : 1, boxShadow: isInactive ? 'none' : '0 2px 10px rgba(215,119,6,0.07)' }}
    >
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Code & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: isInactive ? '#F3F4F6' : '#FEF3C7' }}>
              {coupon.discountType === 'percentage'
                ? <Percent size={20} style={{ color: isInactive ? '#9CA3AF' : '#D97706' }} />
                : <DollarSign size={20} style={{ color: isInactive ? '#9CA3AF' : '#D97706' }} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base" style={{ color: isInactive ? '#6B7280' : '#1F2937' }}>{coupon.code}</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={isInactive
                  ? { backgroundColor: '#F3F4F6', color: '#6B7280' }
                  : { backgroundColor: '#DCFCE7', color: '#15803D' }}>
                  {isInactive ? 'Inactive' : 'Active'}
                </span>
              </div>
              {coupon.description && <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{coupon.description}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 sm:ml-auto">
            <div className="flex items-center gap-1 text-sm font-bold" style={{ color: '#D97706' }}>
              {coupon.discountType === 'percentage' ? <Percent size={13} /> : <DollarSign size={13} />}
              {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₦${coupon.discountValue}`}
              <span className="font-normal text-xs" style={{ color: '#9CA3AF' }}>off</span>
            </div>

            <button onClick={onViewStudents} className="flex items-center gap-1 text-xs font-bold transition-colors" style={{ color: '#D97706' }}>
              <Users size={13} />
              {coupon.usedCount}{coupon.usageLimit !== null && ` / ${coupon.usageLimit}`} used
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            <div className="flex items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
              <Calendar size={13} />
              {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'No expiry'}
            </div>

            {(isExpired || isLimitReached) && !isInactive && (
              <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                {isExpired ? 'Expired' : 'Limit reached'}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:pl-4" style={{ borderLeft: '1px solid #E7DCCB' }}>
            <button onClick={onToggle} disabled={isToggling}
              className="p-2 rounded-xl transition-colors"
              style={coupon.isActive ? { backgroundColor: '#DCFCE7', color: '#15803D' } : { backgroundColor: '#F3F4F6', color: '#9CA3AF' }}
              title={coupon.isActive ? 'Deactivate' : 'Activate'}>
              {isToggling ? <Loader2 size={17} className="animate-spin" /> : coupon.isActive ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
            </button>
            <button onClick={onDelete} disabled={isDeleting}
              className="p-2 rounded-xl transition-colors"
              style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
              title="Delete coupon">
              {isDeleting ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable students list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden" style={{ borderTop: '1px solid #E7DCCB' }}>
            <div className="p-4" style={{ backgroundColor: '#FFFAF3' }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: '#D97706' }}>
                <Tag size={11} /> Students using this coupon
              </p>
              {loadingStudents ? (
                <div className="flex items-center gap-2 py-4 text-sm" style={{ color: '#9CA3AF' }}>
                  <Loader2 size={15} className="animate-spin" /> Loading students…
                </div>
              ) : !students || students.length === 0 ? (
                <p className="text-sm py-2" style={{ color: '#9CA3AF' }}>No students have used this coupon yet.</p>
              ) : (
                <div className="space-y-2">
                  {students.map((s) => (
                    <div key={s._id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5" style={{ border: '1px solid #E7DCCB' }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>{s.student.firstName} {s.student.lastName}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{s.parent.email} · {s.registrationId}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize ${
                          s.status === 'enrolled' ? 'bg-violet-100 text-violet-700' :
                          s.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{s.status}</span>
                        <button onClick={() => onRemoveStudent(s._id)} disabled={removingStudent === s._id}
                          className="p-1.5 rounded-lg transition-colors" style={{ color: '#DC2626' }}
                          title="Remove from coupon">
                          {removingStudent === s._id ? <Loader2 size={13} className="animate-spin" /> : <UserX size={13} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
