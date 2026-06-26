'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, CheckCircle, XCircle, ToggleLeft, ToggleRight,
  AlertTriangle, Info, Loader2,
} from 'lucide-react';
import {
  PLAN_FEES,
  REGISTRATION_FEE,
  calcInstallment,
  formatNaira,
  isInstallmentEligible,
} from '@/lib/installment';

const PLAN_META: Record<string, { name: string; duration: string }> = {
  'starter':           { name: 'Starter Plan',             duration: '1 Month'  },
  'stem-explorer':     { name: 'STEM Explorer Program',    duration: '2 Months' },
  'growth':            { name: 'Growth Plan',              duration: '3 Months' },
  'short':             { name: 'Short Program',            duration: '2 Months' },
  'mastery':           { name: 'Mastery Plan',             duration: '6 Months' },
  'platinum':          { name: 'Platinum Plan',            duration: '6 Months' },
  'holiday-explorer':  { name: 'Holiday Explorer Track',   duration: '1 Month'  },
  'holiday-innovator': { name: 'Holiday Innovator Track',  duration: '2 Months' },
};

export default function PlansPage() {
  const [installmentEnabled, setInstallmentEnabled] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings?key=installment_enabled')
      .then(r => r.json())
      .then(d => { if (d.success) setInstallmentEnabled(d.value === 'true'); })
      .catch(() => setInstallmentEnabled(false));
  }, []);

  async function toggleInstallment() {
    if (installmentEnabled === null) return;
    setToggling(true);
    try {
      const next = !installmentEnabled;
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'installment_enabled', value: String(next) }),
      });
      const d = await res.json();
      if (d.success) {
        setInstallmentEnabled(next);
        setToast(next ? 'Installment plan enabled' : 'Installment plan disabled');
        setTimeout(() => setToast(''), 3000);
      }
    } finally {
      setToggling(false);
    }
  }

  const plans = Object.entries(PLAN_META);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Plans</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Pricing plans, fees, and installment eligibility</p>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', color: '#15803D' }}
        >
          <CheckCircle size={15} /> {toast}
        </motion.div>
      )}

      {/* Installment toggle card */}
      <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7DCCB', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
            <CreditCard size={18} style={{ color: '#1D4ED8' }} />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: '#1F2937' }}>Installment Payment Plan</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              Allow registrants to pay 50% of the program fee + registration fee today, with the balance due by end of first month.
            </p>
          </div>
        </div>
        <button
          onClick={toggleInstallment}
          disabled={toggling || installmentEnabled === null}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          style={installmentEnabled
            ? { backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC' }
            : { backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
        >
          {toggling ? (
            <Loader2 size={16} className="animate-spin" />
          ) : installmentEnabled ? (
            <><ToggleRight size={18} /> ON</>
          ) : (
            <><ToggleLeft size={18} /> OFF</>
          )}
        </button>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 rounded-2xl p-4"
        style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
        <Info size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#78350F' }}>
          <strong>Installment formula:</strong> Amount due today = 50% of program fee + ₦5,000 registration fee.
          The outstanding 50% balance is due on or before the end of the student's first month of enrollment.
          Starter Plan and Holiday Explorer Track are <strong>not eligible</strong> for installment.
        </p>
      </div>

      {/* Plans table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid #E7DCCB', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <div className="px-5 py-4" style={{ backgroundColor: '#FFFAF3', borderBottom: '1px solid #E7DCCB' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D97706' }}>
            All Pricing Plans
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {plans.map(([id, meta], i) => {
            const eligible = isInstallmentEligible(id);
            const fee = PLAN_FEES[id] ?? 0;
            const bd = eligible ? calcInstallment(id) : null;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 bg-white"
              >
                {/* Plan name + duration */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm" style={{ color: '#1F2937' }}>{meta.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>{meta.duration}</span>
                    {eligible ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                        style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
                        <CheckCircle size={10} /> Installment eligible
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                        style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                        <AlertTriangle size={10} /> Full payment only
                      </span>
                    )}
                  </div>
                </div>

                {/* Fee breakdown */}
                <div className="flex items-center gap-6 flex-shrink-0 text-right flex-wrap">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Program Fee</p>
                    <p className="text-sm font-black" style={{ color: '#D97706' }}>{formatNaira(fee)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Reg. Fee</p>
                    <p className="text-sm font-black" style={{ color: '#6B7280' }}>{formatNaira(REGISTRATION_FEE)}</p>
                  </div>
                  {bd ? (
                    <>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Due Today (Install.)</p>
                        <p className="text-sm font-black" style={{ color: '#1D4ED8' }}>{formatNaira(bd.amountDueToday)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Outstanding</p>
                        <p className="text-sm font-black" style={{ color: '#DC2626' }}>{formatNaira(bd.outstandingBalance)}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Total (Full Pay)</p>
                      <p className="text-sm font-black" style={{ color: '#15803D' }}>{formatNaira(fee + REGISTRATION_FEE)}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
