'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, ToggleLeft, ToggleRight, Tag, Percent, DollarSign,
  Calendar, Users, Loader2, AlertCircle, CheckCircle, X,
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

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
          <h1 className="text-2xl font-bold text-gray-900">Coupon Codes</h1>
          <p className="text-gray-500 mt-1">Create and manage discount coupons for registrations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Coupons</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{coupons.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCoupons.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Inactive</p>
          <p className="text-2xl font-bold text-gray-500 mt-1">{inactiveCoupons.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Uses</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <>
          {/* Active Coupons */}
          {activeCoupons.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Active Coupons ({activeCoupons.length})
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
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Coupons */}
          {inactiveCoupons.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Inactive Coupons ({inactiveCoupons.length})
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
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {coupons.length === 0 && !loading && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="text-indigo-600" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No coupons yet</h3>
              <p className="text-gray-500 mt-1 mb-4">Create your first coupon to offer discounts</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                Create Coupon
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Create New Coupon</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={createCoupon} className="p-6 space-y-4">
              {createError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={16} />
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., FREE2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                />
                <p className="text-xs text-gray-500 mt-1">Letters, numbers, hyphens, underscores only</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder="e.g., Free registration for promo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₦)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={newCoupon.discountType === 'percentage' ? 100 : 999999}
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                    placeholder={newCoupon.discountType === 'percentage' ? '100' : '5000'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newCoupon.usageLimit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newCoupon.expiresAt}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newCoupon.code || !newCoupon.discountValue}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  {creating ? 'Creating...' : 'Create Coupon'}
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
}: {
  coupon: Coupon;
  onToggle: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDeleting: boolean;
  isInactive?: boolean;
}) {
  const isExpired = coupon.expiresAt && new Date() > new Date(coupon.expiresAt);
  const isLimitReached = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;

  return (
    <div
      className={`bg-white rounded-xl p-5 border transition-all ${
        isInactive ? 'border-gray-200 opacity-75' : 'border-indigo-100 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Code & Badge */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isInactive ? 'bg-gray-100' : 'bg-indigo-50'
          }`}>
            {coupon.discountType === 'percentage' ? (
              <Percent className={isInactive ? 'text-gray-500' : 'text-indigo-600'} size={22} />
            ) : (
              <DollarSign className={isInactive ? 'text-gray-500' : 'text-indigo-600'} size={22} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-mono font-bold text-lg ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                {coupon.code}
              </span>
              {!isInactive && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Active
                </span>
              )}
              {isInactive && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  Inactive
                </span>
              )}
            </div>
            {coupon.description && (
              <p className="text-sm text-gray-500">{coupon.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 sm:ml-auto">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            {coupon.discountType === 'percentage' ? <Percent size={14} /> : <DollarSign size={14} />}
            <span className="font-semibold">
              {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₦${coupon.discountValue}`}
            </span>
            <span className="text-gray-400">off</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Users size={14} />
            <span>
              {coupon.usedCount}
              {coupon.usageLimit !== null && ` / ${coupon.usageLimit}`} used
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Calendar size={14} />
            <span>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'No expiry'}</span>
          </div>

          {(isExpired || isLimitReached) && !isInactive && (
            <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg">
              {isExpired ? 'Expired' : 'Limit reached'}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:pl-4 sm:border-l border-gray-200">
          <button
            onClick={onToggle}
            disabled={isToggling}
            className={`p-2 rounded-lg transition-colors ${
              coupon.isActive
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title={coupon.isActive ? 'Deactivate' : 'Activate'}
          >
            {isToggling ? (
              <Loader2 size={18} className="animate-spin" />
            ) : coupon.isActive ? (
              <ToggleRight size={18} />
            ) : (
              <ToggleLeft size={18} />
            )}
          </button>

          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Delete coupon"
          >
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
