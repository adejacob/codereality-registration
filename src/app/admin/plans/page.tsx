'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, CheckCircle, ToggleLeft, ToggleRight,
  AlertTriangle, Info, Loader2, Plus, Trash2, X,
} from 'lucide-react';
import { REGISTRATION_FEE, calcInstallmentFromFee, formatNaira } from '@/lib/installment';

interface Plan {
  _id: string;
  id: string;
  name: string;
  duration: string;
  fee: number;
  features: string[];
  installmentEligible: boolean;
  popular: boolean;
  isActive: boolean;
}

const BLANK = { name: '', duration: '', fee: '', installmentEligible: true, popular: false };

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [installmentEnabled, setInstallmentEnabled] = useState<boolean | null>(null);
  const [togglingGlobal, setTogglingGlobal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function load() {
    setLoading(true);
    try {
      const [plansRes, settingsRes] = await Promise.all([
        fetch('/api/admin/plans').then(r => r.json()),
        fetch('/api/admin/settings?key=installment_enabled').then(r => r.json()),
      ]);
      if (plansRes.success) setPlans(plansRes.data);
      if (settingsRes.success) setInstallmentEnabled(settingsRes.value === 'true');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleGlobal() {
    if (installmentEnabled === null) return;
    setTogglingGlobal(true);
    try {
      const next = !installmentEnabled;
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'installment_enabled', value: String(next) }),
      });
      if ((await res.json()).success) {
        setInstallmentEnabled(next);
        showToast(next ? 'Installment plan enabled globally' : 'Installment plan disabled globally');
      }
    } finally { setTogglingGlobal(false); }
  }

  async function togglePlanEligibility(plan: Plan) {
    setTogglingId(plan.id);
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ installmentEligible: !plan.installmentEligible }),
      });
      const d = await res.json();
      if (d.success) {
        setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, installmentEligible: !p.installmentEligible } : p));
        showToast(`${plan.name} updated`);
      }
    } finally { setTogglingId(null); }
  }

  async function deletePlan(plan: Plan) {
    if (!confirm(`Delete "${plan.name}"? This cannot be undone.`)) return;
    setDeletingId(plan.id);
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, { method: 'DELETE' });
      if ((await res.json()).success) {
        setPlans(prev => prev.filter(p => p.id !== plan.id));
        showToast(`${plan.name} deleted`);
      }
    } finally { setDeletingId(null); }
  }

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    if (!form.name.trim() || !form.duration.trim() || !form.fee) {
      setCreateError('Name, duration, and fee are required.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          duration: form.duration.trim(),
          fee: Number(form.fee),
          installmentEligible: form.installmentEligible,
          popular: form.popular,
          features: [],
        }),
      });
      const d = await res.json();
      if (d.success) {
        setPlans(prev => [...prev, d.data]);
        setShowModal(false);
        setForm(BLANK);
        showToast(`${d.data.name} created`);
      } else {
        setCreateError(d.message || 'Failed to create plan');
      }
    } finally { setCreating(false); }
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Plans</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{plans.length} plan{plans.length !== 1 ? 's' : ''} · manage pricing and installment eligibility</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setCreateError(''); setForm(BLANK); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ backgroundColor: '#D97706' }}
        >
          <Plus size={16} /> New Plan
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', color: '#15803D' }}>
            <CheckCircle size={15} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Installment toggle */}
      <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7DCCB', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
            <CreditCard size={18} style={{ color: '#1D4ED8' }} />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: '#1F2937' }}>Global Installment Toggle</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              When OFF, the installment option is hidden from all registrants regardless of per-plan settings.
            </p>
          </div>
        </div>
        <button onClick={toggleGlobal} disabled={togglingGlobal || installmentEnabled === null}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          style={installmentEnabled
            ? { backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC' }
            : { backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
          {togglingGlobal ? <Loader2 size={16} className="animate-spin" /> : installmentEnabled ? <><ToggleRight size={18} /> ON</> : <><ToggleLeft size={18} /> OFF</>}
        </button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 rounded-2xl p-4" style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
        <Info size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#78350F' }}>
          <strong>Installment formula:</strong> Amount due today = 50% of program fee + ₦5,000 registration fee.
          Per-plan eligibility lets you control which plans support installment independently of the global toggle.
        </p>
      </div>

      {/* Plans list */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E7DCCB', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: '#FFFAF3', borderBottom: '1px solid #E7DCCB' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D97706' }}>All Pricing Plans</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white">
            <Loader2 size={24} className="animate-spin" style={{ color: '#D97706' }} />
          </div>
        ) : plans.length === 0 ? (
          <div className="py-12 text-center bg-white">
            <p className="text-sm" style={{ color: '#9CA3AF' }}>No plans yet. Click &quot;New Plan&quot; to add one.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {plans.map((plan, i) => {
              const bd = plan.installmentEligible ? calcInstallmentFromFee(plan.fee) : null;
              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="px-5 py-4 bg-white flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-sm" style={{ color: '#1F2937' }}>{plan.name}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>{plan.duration}</span>
                      {plan.installmentEligible ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
                          <CheckCircle size={10} /> Installment eligible
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                          <AlertTriangle size={10} /> Full payment only
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap text-xs" style={{ color: '#6B7280' }}>
                      <span>Fee: <strong style={{ color: '#D97706' }}>{formatNaira(plan.fee)}</strong></span>
                      <span>Reg: <strong>{formatNaira(REGISTRATION_FEE)}</strong></span>
                      {bd ? (
                        <>
                          <span>Due today: <strong style={{ color: '#1D4ED8' }}>{formatNaira(bd.amountDueToday)}</strong></span>
                          <span>Outstanding: <strong style={{ color: '#DC2626' }}>{formatNaira(bd.outstandingBalance)}</strong></span>
                        </>
                      ) : (
                        <span>Total: <strong style={{ color: '#15803D' }}>{formatNaira(plan.fee + REGISTRATION_FEE)}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Installment eligibility toggle */}
                    <button
                      onClick={() => togglePlanEligibility(plan)}
                      disabled={togglingId === plan.id}
                      title={plan.installmentEligible ? 'Click to set Full Payment only' : 'Click to allow Installment'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={plan.installmentEligible
                        ? { backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC' }
                        : { backgroundColor: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' }}>
                      {togglingId === plan.id ? <Loader2 size={12} className="animate-spin" /> :
                        plan.installmentEligible ? <><ToggleRight size={14} /> Installment</> : <><ToggleLeft size={14} /> Full Only</>}
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => deletePlan(plan)}
                      disabled={deletingId === plan.id}
                      className="p-2 rounded-lg transition-all"
                      style={{ color: '#9CA3AF' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                      title="Delete plan"
                    >
                      {deletingId === plan.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Plan Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black" style={{ color: '#1F2937' }}>New Plan</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg" style={{ color: '#6B7280' }}><X size={18} /></button>
              </div>
              <form onSubmit={createPlan} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#374151' }}>Plan Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Elite Program" required
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    style={{ borderColor: '#E7DCCB', color: '#1F2937' }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#374151' }}>Duration *</label>
                  <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    placeholder="e.g. 4 Months (16 Weeks)" required
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    style={{ borderColor: '#E7DCCB', color: '#1F2937' }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#374151' }}>Program Fee (₦) *</label>
                  <input value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))}
                    placeholder="e.g. 200000" type="number" min="0" required
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    style={{ borderColor: '#E7DCCB', color: '#1F2937' }} />
                  {form.fee && Number(form.fee) > 0 && (
                    <p className="text-[11px] mt-1" style={{ color: '#6B7280' }}>
                      Total (full pay): {formatNaira(Number(form.fee) + REGISTRATION_FEE)} &nbsp;·&nbsp;
                      Installment due today: {formatNaira(Math.round(Number(form.fee) / 2) + REGISTRATION_FEE)}
                    </p>
                  )}
                </div>

                {/* Payment type */}
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: '#374151' }}>Payment Type</label>
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, installmentEligible: true }))}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
                      style={form.installmentEligible
                        ? { borderColor: '#1D4ED8', backgroundColor: '#EFF6FF', color: '#1D4ED8' }
                        : { borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#6B7280' }}>
                      <ToggleRight size={14} className="inline mr-1" /> Installment eligible
                    </button>
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, installmentEligible: false }))}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
                      style={!form.installmentEligible
                        ? { borderColor: '#D97706', backgroundColor: '#FFFBEB', color: '#92400E' }
                        : { borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#6B7280' }}>
                      <ToggleLeft size={14} className="inline mr-1" /> Full payment only
                    </button>
                  </div>
                </div>

                {createError && (
                  <p className="text-xs text-red-600 font-semibold">{createError}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold border"
                    style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>Cancel</button>
                  <button type="submit" disabled={creating}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#D97706' }}>
                    {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                    {creating ? 'Creating…' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
