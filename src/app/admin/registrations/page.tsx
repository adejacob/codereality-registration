'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, Trash2, Eye, ChevronLeft, ChevronRight,
  X, CheckCircle, Clock, PhoneCall, UserCheck, XCircle, Loader2,
  FileSpreadsheet, FileText, GraduationCap, FileDown, RotateCcw, Pencil,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────── */
interface Registration {
  _id: string;
  registrationId: string;
  status: 'pending' | 'contacted' | 'approved' | 'enrolled' | 'rejected';
  paymentStatus: 'pending_payment' | 'payment_submitted' | 'payment_confirmed';
  notes: string;
  enrollmentNumber?: string;
  enrollmentDate?: string;
  student: { firstName: string; lastName: string; gender: string; dateOfBirth: string; schoolName: string; classGrade: string; photoUrl?: string };
  parent:  { fullName: string; email: string; phone: string; whatsapp: string; address: string; occupation: string };
  programs: { programs: string[] };
  schedule: { schedule: string };
  payment:  { paymentType: string; coupon?: string; selectedPlan?: 'growth' | 'short' | 'mastery' | 'platinum' };
  createdAt: string;
}

interface Pagination { total: number; page: number; pages: number; limit: number }

/* ─── Constants ─────────────────────────────────────────────── */
const STATUSES = ['', 'pending', 'contacted', 'approved', 'enrolled', 'rejected'] as const;

const PROGRAMS = ['', 'coding', 'robotics', 'ai', 'web', 'mobile', 'game', '3d', 'graphic', 'digital', 'scratch'];

const PAYMENT_STATUS_META: Record<string, { label: string; color: string }> = {
  pending_payment:    { label: 'Pending Payment',    color: 'bg-orange-100 text-orange-700 border-orange-200' },
  payment_submitted:  { label: 'Payment Submitted',  color: 'bg-blue-100 text-blue-700 border-blue-200'       },
  payment_confirmed:  { label: 'Payment Confirmed',  color: 'bg-green-100 text-green-700 border-green-200'    },
};

const STATUS_META: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number }> }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700 border-amber-200',   icon: Clock      },
  contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: PhoneCall  },
  approved:  { label: 'Approved',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  enrolled:  { label: 'Enrolled',  color: 'bg-violet-100 text-violet-700 border-violet-200', icon: UserCheck  },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-700 border-red-200',          icon: XCircle    },
};

/* ─── Detail Modal ───────────────────────────────────────────── */
function DetailModal({ reg, onClose, onUpdate }: { reg: Registration; onClose: () => void; onUpdate: (r: Registration) => void }) {
  const [tab, setTab]                      = useState<'view' | 'edit'>('view');
  const [status, setStatus]               = useState(reg.status);
  const [paymentStatus, setPaymentStatus]  = useState(reg.paymentStatus ?? 'pending_payment');
  const [notes, setNotes]                  = useState(reg.notes ?? '');
  const [saving, setSaving]                = useState(false);
  const [saved, setSaved]                  = useState(false);
  const [deleting, setDeleting]            = useState(false);
  const [enrolling, setEnrolling]          = useState(false);
  const [enrollError, setEnrollError]      = useState('');
  const [localEnrollNum, setLocalEnrollNum] = useState(reg.enrollmentNumber ?? '');
  const [localEnrollDate, setLocalEnrollDate] = useState(reg.enrollmentDate ?? '');

  // Edit info state
  const [editStudent, setEditStudent] = useState({ ...reg.student });
  const [editParent,  setEditParent]  = useState({ ...reg.parent });
  const [editSaving,  setEditSaving]  = useState(false);
  const [editSaved,   setEditSaved]   = useState(false);
  const [editError,   setEditError]   = useState('');

  async function saveInfo() {
    setEditSaving(true);
    setEditError('');
    const res = await fetch(`/api/admin/registrations/${reg._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student: editStudent, parent: editParent }),
    });
    const d = await res.json();
    if (d.success) {
      onUpdate(d.data);
      setEditSaved(true);
      setTimeout(() => setEditSaved(false), 2500);
    } else {
      setEditError(d.message ?? 'Save failed');
    }
    setEditSaving(false);
  }

  const isEnrolled = status === 'enrolled' && !!localEnrollNum;

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/registrations/${reg._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentStatus, notes }),
    });
    const d = await res.json();
    if (d.success) { onUpdate(d.data); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  async function confirmEnrollment() {
    if (!confirm(`Confirm enrollment for ${reg.student.firstName} ${reg.student.lastName}? This will send the enrollment confirmation email and PDF to the parent.`)) return;
    setEnrolling(true);
    setEnrollError('');
    const res = await fetch(`/api/admin/registrations/${reg._id}/enroll`, { method: 'POST' });
    const d = await res.json();
    if (d.success) {
      setStatus('enrolled');
      setPaymentStatus('payment_confirmed');
      setLocalEnrollNum(d.data.enrollmentNumber);
      setLocalEnrollDate(new Date(d.data.enrollmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
      onUpdate({ ...reg, status: 'enrolled', paymentStatus: 'payment_confirmed', enrollmentNumber: d.data.enrollmentNumber, enrollmentDate: d.data.enrollmentDate });
    } else {
      setEnrollError(d.message ?? 'Enrollment failed');
    }
    setEnrolling(false);
  }

  async function revokeEnrollment() {
    if (!confirm('Revoke enrollment? This will set status back to Approved and clear enrollment data.')) return;
    const res = await fetch(`/api/admin/registrations/${reg._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved', paymentStatus: 'payment_confirmed', enrollmentNumber: null, enrollmentDate: null }),
    });
    const d = await res.json();
    if (d.success) {
      setStatus('approved');
      setLocalEnrollNum('');
      setLocalEnrollDate('');
      onUpdate(d.data);
    }
  }

  function downloadCertificate() {
    window.open(`/api/admin/registrations/${reg._id}/certificate`, '_blank');
  }

  async function remove() {
    if (!confirm(`Delete registration ${reg.registrationId}? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/registrations/${reg._id}`, { method: 'DELETE' });
    const d = await res.json();
    if (d.success) onClose();
    setDeleting(false);
  }

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || '—'}</p>
    </div>
  );

  const EditField = ({
    label, value, onChange, type = 'text',
  }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
    <div>
      <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 pt-4 pb-0 rounded-t-3xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-bold text-lg">{reg.student.firstName} {reg.student.lastName}</p>
              <p className="text-white/70 text-xs font-mono">{reg.registrationId}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <X size={22} />
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {(['view', 'edit'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-xl transition-colors ${
                  tab === t ? 'bg-white text-indigo-600' : 'text-white/70 hover:text-white'
                }`}
              >
                {t === 'edit' && <Pencil size={11} />}
                {t === 'view' ? 'View Details' : 'Edit Info'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {tab === 'edit' ? (
            /* ── EDIT INFO TAB ─────────────────────────────── */
            <>
              <section>
                <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Pencil size={11} /> Student Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
                  <EditField label="First Name"    value={editStudent.firstName}   onChange={(v) => setEditStudent(s => ({ ...s, firstName: v }))} />
                  <EditField label="Last Name"     value={editStudent.lastName}    onChange={(v) => setEditStudent(s => ({ ...s, lastName: v }))} />
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</label>
                    <select
                      value={editStudent.gender}
                      onChange={(e) => setEditStudent(s => ({ ...s, gender: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <EditField label="Date of Birth" value={editStudent.dateOfBirth} onChange={(v) => setEditStudent(s => ({ ...s, dateOfBirth: v }))} />
                  <EditField label="School Name"   value={editStudent.schoolName}  onChange={(v) => setEditStudent(s => ({ ...s, schoolName: v }))} />
                  <EditField label="Class / Grade" value={editStudent.classGrade}  onChange={(v) => setEditStudent(s => ({ ...s, classGrade: v }))} />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Pencil size={11} /> Parent Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
                  <div className="col-span-2">
                    <EditField label="Full Name"  value={editParent.fullName}   onChange={(v) => setEditParent(p => ({ ...p, fullName: v }))} />
                  </div>
                  <EditField label="Email"       value={editParent.email}      onChange={(v) => setEditParent(p => ({ ...p, email: v }))}      type="email" />
                  <EditField label="Phone"       value={editParent.phone}      onChange={(v) => setEditParent(p => ({ ...p, phone: v }))} />
                  <EditField label="WhatsApp"    value={editParent.whatsapp}   onChange={(v) => setEditParent(p => ({ ...p, whatsapp: v }))} />
                  <EditField label="Occupation"  value={editParent.occupation} onChange={(v) => setEditParent(p => ({ ...p, occupation: v }))} />
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Address</label>
                    <textarea
                      rows={2}
                      value={editParent.address}
                      onChange={(e) => setEditParent(p => ({ ...p, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                    />
                  </div>
                </div>
              </section>

              {editError && <p className="text-red-500 text-xs px-1">{editError}</p>}

              <button
                onClick={saveInfo}
                disabled={editSaving}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all shadow text-sm disabled:opacity-60"
              >
                {editSaving ? <Loader2 size={15} className="animate-spin" /> : editSaved ? <CheckCircle size={15} /> : <Pencil size={15} />}
                {editSaving ? 'Saving…' : editSaved ? 'Saved!' : 'Save Student & Parent Info'}
              </button>
            </>
          ) : (
            /* ── VIEW TAB ──────────────────────────────────── */
            <>
          {/* Student */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Student Information</h3>
            <div className="bg-gray-50 rounded-2xl p-4">
              {/* Student Photo */}
              <div className="flex justify-center mb-4">
                {reg.student.photoUrl ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={reg.student.photoUrl}
                        alt={`${reg.student.firstName} ${reg.student.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-indigo-400">
                      {reg.student.firstName?.charAt(0)}{reg.student.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name"   value={reg.student.firstName} />
                <Field label="Last Name"    value={reg.student.lastName}  />
                <Field label="Gender"       value={reg.student.gender}    />
                <Field label="Date of Birth" value={reg.student.dateOfBirth} />
                <Field label="School"       value={reg.student.schoolName} />
                <Field label="Class/Grade"  value={reg.student.classGrade} />
              </div>
            </div>
          </section>

          {/* Parent */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Parent Information</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
              <Field label="Full Name"   value={reg.parent.fullName}   />
              <Field label="Email"       value={reg.parent.email}      />
              <Field label="Phone"       value={reg.parent.phone}      />
              <Field label="WhatsApp"    value={reg.parent.whatsapp}   />
              <Field label="Occupation"  value={reg.parent.occupation} />
              <Field label="Address"     value={reg.parent.address}    />
            </div>
          </section>

          {/* Programs + Schedule + Payment */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Program & Schedule</h3>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Programs</p>
                <div className="flex flex-wrap gap-2">
                  {reg.programs.programs.map((p) => (
                    <span key={p} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium capitalize">{p}</span>
                  ))}
                </div>
              </div>
              <Field label="Schedule"     value={reg.schedule.schedule}  />
              <Field label="Payment Type" value={reg.payment.paymentType} />
              {reg.payment.selectedPlan && (
                <>
                  <Field 
                    label="Selected Plan" 
                    value={{
                      growth: 'Growth Plan (₦150,000) - 3 Months',
                      short: 'Short Program (₦100,000) - 2 Months',
                      mastery: 'Mastery Plan (₦250,000) - 6 Months',
                      platinum: 'Platinum Plan (₦300,000) - 6 Months',
                    }[reg.payment.selectedPlan] || reg.payment.selectedPlan} 
                  />
                </>
              )}
              {reg.payment.coupon && <Field label="Coupon" value={reg.payment.coupon} />}
            </div>
          </section>

          {/* Enrollment Status Banner */}
          {isEnrolled && (
            <section>
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Enrollment Number</p>
                    <p className="text-white text-xl font-black font-mono tracking-wider">{localEnrollNum}</p>
                    {localEnrollDate && <p className="text-white/70 text-xs mt-1">Enrolled: {typeof localEnrollDate === 'string' ? localEnrollDate : new Date(localEnrollDate).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={downloadCertificate}
                      className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      <FileDown size={13} /> Download Letter
                    </button>
                    <button
                      onClick={revokeEnrollment}
                      className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-red-500/40 text-white/80 rounded-xl text-xs font-medium transition-colors"
                    >
                      <RotateCcw size={13} /> Revoke
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Status + Notes */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Admin Actions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.filter(Boolean).map((s) => {
                    const meta = STATUS_META[s];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={s}
                        onClick={() => setStatus(s as Registration['status'])}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                          ${status === s ? meta.color + ' ring-2 ring-offset-1 ring-indigo-400' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                      >
                        <Icon size={12} /> {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['pending_payment', 'payment_submitted', 'payment_confirmed'] as const).map((ps) => {
                    const meta = PAYMENT_STATUS_META[ps];
                    return (
                      <button
                        key={ps}
                        onClick={() => setPaymentStatus(ps)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                          ${paymentStatus === ps ? meta.color + ' ring-2 ring-offset-1 ring-indigo-400' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this registration…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

              {/* Confirm Enrollment CTA */}
              {!isEnrolled && (
                <div className="pt-2">
                  {enrollError && <p className="text-red-500 text-xs mb-2">{enrollError}</p>}
                  <button
                    onClick={confirmEnrollment}
                    disabled={enrolling}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-200/50 text-sm disabled:opacity-60"
                  >
                    {enrolling ? <Loader2 size={16} className="animate-spin" /> : <GraduationCap size={16} />}
                    {enrolling ? 'Confirming Enrollment…' : 'Confirm Enrollment'}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2">Sends enrollment confirmation email + PDF letter to parent</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={remove}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : null}
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          </section>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pagination, setPagination]       = useState<Pagination>({ total: 0, page: 1, pages: 1, limit: 20 });
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [selected, setSelected]           = useState<Registration | null>(null);
  const [exporting, setExporting]         = useState<'xlsx' | 'csv' | null>(null);

  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [program,  setProgram]  = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [page,     setPage]     = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search)   params.set('search',   search);
      if (status)   params.set('status',   status);
      if (program)  params.set('program',  program);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo)   params.set('dateTo',   dateTo);
      params.set('page',  String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/admin/registrations?${params}`);
      const d   = await res.json();
      if (d.success) {
        setRegistrations(d.data);
        setPagination(d.pagination);
      } else {
        setError(d.message || 'Failed to load registrations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load registrations - check console');
      console.error('Fetch registrations error:', err);
    }
    setLoading(false);
  }, [search, status, program, dateFrom, dateTo, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, status, program, dateFrom, dateTo]);

  function handleUpdate(updated: Registration) {
    setRegistrations((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    setSelected(updated);
  }

  async function handleExport(fmt: 'xlsx' | 'csv') {
    setExporting(fmt);
    const res = await fetch(`/api/admin/export?format=${fmt}`);
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `registrations-${Date.now()}.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(null);
  }

  const clearFilters = () => { setSearch(''); setStatus(''); setProgram(''); setDateFrom(''); setDateTo(''); };
  const hasFilters   = search || status || program || dateFrom || dateTo;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
            <p className="text-gray-500 text-sm mt-0.5">{pagination.total} total registration{pagination.total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={!!exporting}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors font-medium"
            >
              {exporting === 'csv' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              disabled={!!exporting}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow"
            >
              {exporting === 'xlsx' ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
              Export Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={15} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Filters</span>
            {hasFilters && (
              <button onClick={clearFilters} className="ml-auto text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700"
            >
              <option value="">All Statuses</option>
              {STATUSES.filter(Boolean).map((s) => (
                <option key={s} value={s} className="capitalize">{STATUS_META[s].label}</option>
              ))}
            </select>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700"
            >
              <option value="">All Programs</option>
              {PROGRAMS.filter(Boolean).map((p) => (
                <option key={p} value={p} className="capitalize">{p}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <span className="text-red-500 text-2xl">⚠️</span>
              </div>
              <p className="text-red-600 font-medium mb-2">Error Loading Data</p>
              <p className="text-red-500 text-sm max-w-md mx-auto">{error}</p>
            </div>
          ) : loading ? (
            <div className="p-8 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <Download size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No registrations found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-gray-50">
              {registrations.map((r) => {
                const meta = STATUS_META[r.status];
                const pmeta = PAYMENT_STATUS_META[r.paymentStatus ?? 'pending_payment'];
                return (
                  <div key={r._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{r.student.firstName} {r.student.lastName}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{r.registrationId}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${meta?.color ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {r.status}
                          </span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${pmeta?.color ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {pmeta?.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {r.programs.programs.slice(0, 3).map((p) => (
                            <span key={p} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs capitalize">{p}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelected(r)}
                        className="flex-shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                      >
                        <Eye size={13} /> View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold hidden lg:table-cell">School</th>
                    <th className="px-5 py-3 font-semibold hidden lg:table-cell">Programs</th>
                    <th className="px-5 py-3 font-semibold hidden xl:table-cell">Schedule</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold hidden lg:table-cell">Payment</th>
                    <th className="px-5 py-3 font-semibold hidden xl:table-cell">Registered</th>
                    <th className="px-5 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {registrations.map((r) => {
                    const meta = STATUS_META[r.status];
                    const Icon = meta?.icon;
                    return (
                      <tr key={r._id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-gray-400">{r.registrationId}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{r.student.firstName} {r.student.lastName}</p>
                          <p className="text-xs text-gray-400">{r.parent.email}</p>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell text-gray-600 text-xs">{r.student.schoolName}</td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {r.programs.programs.slice(0, 2).map((p) => (
                              <span key={p} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs capitalize">{p}</span>
                            ))}
                            {r.programs.programs.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">+{r.programs.programs.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden xl:table-cell text-gray-600 text-xs capitalize">{r.schedule.schedule}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${meta?.color ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {Icon && <Icon size={11} />} {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${PAYMENT_STATUS_META[r.paymentStatus ?? 'pending_payment']?.color ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {PAYMENT_STATUS_META[r.paymentStatus ?? 'pending_payment']?.label ?? 'Pending Payment'}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden xl:table-cell text-gray-400 text-xs">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelected(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-100 transition-colors"
                          >
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 text-sm text-gray-500">
              <span>Page {pagination.page} of {pagination.pages} ({pagination.total} records)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <DetailModal
            reg={selected}
            onClose={() => setSelected(null)}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>
    </>
  );
}
