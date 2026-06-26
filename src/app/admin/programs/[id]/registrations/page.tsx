'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Filter, X, Loader2, Users, CreditCard,
  Repeat, AlertCircle, ChevronLeft, ChevronRight, Eye,
  Clock, PhoneCall, CheckCircle, UserCheck, XCircle, Tag,
} from 'lucide-react';
import Link from 'next/link';

interface Reg {
  _id: string;
  registrationId: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  student: { firstName: string; lastName: string };
  parent: { fullName: string; email: string; phone: string };
  programs: { programs: string[] };
  payment: { paymentType: string; selectedPlan?: string; coupon?: string };
  schedule: { schedule?: string };
}

interface Summary { total: number; full: number; installment: number; pending: number }
interface Pagination { total: number; page: number; pages: number; limit: number }

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  contacted: 'bg-blue-100 text-blue-700',
  approved:  'bg-emerald-100 text-emerald-700',
  enrolled:  'bg-violet-100 text-violet-700',
  rejected:  'bg-red-100 text-red-700',
};
const PAYMENT_COLORS: Record<string, string> = {
  pending_payment:    'bg-orange-100 text-orange-700',
  payment_submitted:  'bg-blue-100 text-blue-700',
  payment_confirmed:  'bg-green-100 text-green-700',
};
const PAYMENT_LABELS: Record<string, string> = {
  pending_payment: 'Pending', payment_submitted: 'Submitted', payment_confirmed: 'Confirmed',
};

export default function ProgramRegistrationsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [programName, setProgramName] = useState('');
  const [regs, setRegs]               = useState<Reg[]>([]);
  const [summary, setSummary]         = useState<Summary>({ total: 0, full: 0, installment: 0, pending: 0 });
  const [pagination, setPagination]   = useState<Pagination>({ total: 0, page: 1, pages: 1, limit: 20 });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [payment, setPayment] = useState('');
  const [sort, setSort]       = useState('newest');
  const [page, setPage]       = useState(1);

  const [selected, setSelected] = useState<Reg | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const p = new URLSearchParams({ program: id, page: String(page), limit: '20', sort });
      if (search)  p.set('search', search);
      if (status)  p.set('status', status);
      if (payment) p.set('paymentType', payment);

      const res  = await fetch(`/api/admin/registrations/by-program?${p}`);
      const data = await res.json();
      if (data.success) {
        setRegs(data.data);
        setSummary(data.summary);
        setPagination(data.pagination);
        setProgramName(data.programName ?? id);
      } else {
        setError(data.message ?? 'Failed to load');
      }
    } catch { setError('Network error'); }
    finally  { setLoading(false); }
  }, [id, page, search, status, payment, sort]);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => { setPage(1); }, [search, status, payment, sort]);

  const statCards = [
    { label: 'Total',        value: summary.total,       icon: Users,       color: '#D97706', bg: '#FFFBEB' },
    { label: 'Full Payment', value: summary.full,        icon: CreditCard,  color: '#059669', bg: '#F0FDF4' },
    { label: 'Installment',  value: summary.installment, icon: Repeat,      color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Pending Pay',  value: summary.pending,     icon: AlertCircle, color: '#DC2626', bg: '#FEF2F2' },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}
          className="p-2 rounded-xl transition-colors"
          style={{ border: '1px solid #E7DCCB', color: '#6B7280' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: '#9CA3AF' }}>
            <Link href="/admin/programs" className="hover:underline">Programs</Link>
            <span>›</span>
            <span className="capitalize">{programName || id}</span>
          </div>
          <h1 className="text-xl font-black tracking-tight capitalize" style={{ color: '#1F2937' }}>
            {programName || id} — Registrations
          </h1>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: bg, border: `1px solid ${color}22` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E7DCCB' }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
            <input type="text" placeholder="Search name, email, ID…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] transition-all"
              style={{ borderColor: '#E7DCCB', color: '#1F2937' }} />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] transition-all"
            style={{ borderColor: '#E7DCCB', color: '#1F2937' }}>
            <option value="">All Statuses</option>
            {['pending','contacted','approved','enrolled','rejected'].map(s => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select value={payment} onChange={e => setPayment(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] transition-all"
            style={{ borderColor: '#E7DCCB', color: '#1F2937' }}>
            <option value="">All Payment Types</option>
            <option value="full">Full Payment</option>
            <option value="installment">Installment</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] transition-all"
            style={{ borderColor: '#E7DCCB', color: '#1F2937' }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Student Name</option>
          </select>
          {(search || status || payment) && (
            <button onClick={() => { setSearch(''); setStatus(''); setPayment(''); }}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-xl transition-colors"
              style={{ border: '1px solid #FECACA', color: '#DC2626' }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7DCCB', boxShadow: '0 2px 8px rgba(215,119,6,0.05)' }}>
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: '#F3E8D4' }} />)}
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="font-bold text-sm" style={{ color: '#DC2626' }}>{error}</p>
          </div>
        ) : regs.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={36} className="mx-auto mb-3 opacity-30" style={{ color: '#D97706' }} />
            <p className="font-bold text-sm" style={{ color: '#6B7280' }}>No registrations found</p>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left" style={{ backgroundColor: '#FFFAF3', borderBottom: '1px solid #E7DCCB' }}>
                    {['Student','Parent / Email','Phone','Plan','Payment','Status','Pay Status','Registered'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: '#9CA3AF' }}>{h}</th>
                    ))}
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {regs.map((r) => (
                    <tr key={r._id} className="transition-colors hover:bg-amber-50/30" style={{ borderBottom: '1px solid #F3EADB' }}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-sm whitespace-nowrap" style={{ color: '#1F2937' }}>{r.student.firstName} {r.student.lastName}</p>
                        <p className="text-[11px] font-mono" style={{ color: '#9CA3AF' }}>{r.registrationId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm whitespace-nowrap" style={{ color: '#374151' }}>{r.parent.fullName}</p>
                        <p className="text-[11px]" style={{ color: '#9CA3AF' }}>{r.parent.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: '#6B7280' }}>{r.parent.phone}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#6B7280' }}>
                        {r.payment.selectedPlan ? <span className="px-2 py-0.5 rounded-full font-semibold capitalize" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>{r.payment.selectedPlan}</span> : r.payment.coupon ? <span className="flex items-center gap-1 text-purple-700"><Tag size={10} />{r.payment.coupon}</span> : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-semibold capitalize ${r.payment.paymentType === 'installment' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {r.payment.paymentType === 'installment' ? 'Installment' : 'Full'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-700'}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${PAYMENT_COLORS[r.paymentStatus] ?? 'bg-gray-100 text-gray-700'}`}>
                          {PAYMENT_LABELS[r.paymentStatus] ?? r.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#9CA3AF' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(r)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                          style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>
                          <Eye size={11} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 text-xs" style={{ borderTop: '1px solid #E7DCCB', color: '#9CA3AF' }}>
                <span>Page {pagination.page} of {pagination.pages} ({pagination.total} records)</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-2 rounded-xl disabled:opacity-40" style={{ border: '1px solid #E7DCCB', color: '#6B7280' }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                    className="p-2 rounded-xl disabled:opacity-40" style={{ border: '1px solid #E7DCCB', color: '#6B7280' }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick-view drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              style={{ border: '1px solid #E7DCCB', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: '#1F2937', borderRadius: '1rem 1rem 0 0' }}>
                <div>
                  <p className="font-black text-white">{selected.student.firstName} {selected.student.lastName}</p>
                  <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{selected.registrationId}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ color: 'rgba(255,255,255,0.6)' }}><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4 text-sm">
                {[
                  ['Parent', selected.parent.fullName],
                  ['Email',  selected.parent.email],
                  ['Phone',  selected.parent.phone],
                  ['Schedule', selected.schedule?.schedule || 'N/A'],
                  ['Plan', selected.payment.selectedPlan || '—'],
                  ['Payment', selected.payment.paymentType],
                  ['Coupon', selected.payment.coupon || '—'],
                  ['Registered', new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{label}</span>
                    <span className="font-medium text-right" style={{ color: '#1F2937' }}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 items-center">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[selected.status] ?? ''}`}>{selected.status}</span>
                </div>
                <div className="flex justify-between gap-4 items-center">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Payment Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PAYMENT_COLORS[selected.paymentStatus] ?? ''}`}>{PAYMENT_LABELS[selected.paymentStatus]}</span>
                </div>
                <div className="pt-2" style={{ borderTop: '1px solid #E7DCCB' }}>
                  <Link href="/admin/registrations"
                    className="flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl text-white transition-all"
                    style={{ backgroundColor: '#D97706' }}>
                    Open Full Record
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
