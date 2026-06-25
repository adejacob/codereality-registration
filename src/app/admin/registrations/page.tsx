'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, Trash2, Eye, ChevronLeft, ChevronRight,
  X, CheckCircle, Clock, PhoneCall, UserCheck, XCircle, Loader2,
  FileSpreadsheet, FileText, GraduationCap, FileDown, RotateCcw, Pencil, Tag,
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
  student: { firstName: string; lastName: string; gender: string; dateOfBirth: string; schoolName: string; classGrade: string; photo?: string };
  parent:  { fullName: string; email: string; phone: string; whatsapp: string; address: string; occupation: string };
  programs: { programs: string[] };
  schedule: { schedule?: string };
  payment:  { paymentType: string; coupon?: string; selectedPlan?: 'starter' | 'stem-explorer' | 'growth' | 'short' | 'mastery' | 'platinum' | 'holiday-explorer' | 'holiday-innovator' };
  createdAt: string;
}

interface Pagination { total: number; page: number; pages: number; limit: number }

/* ─── Constants ─────────────────────────────────────────────── */
const STATUSES = ['', 'pending', 'contacted', 'approved', 'enrolled', 'rejected', 'coupon'] as const;

const PROGRAMS = ['', 'coding', 'robotics', 'ai', 'web', 'mobile', 'game', '3d', 'graphic', 'digital', 'scratch', 'workshop'];

const PAYMENT_STATUS_META: Record<string, { label: string; color: string }> = {
  pending_payment:    { label: 'Pending Payment',    color: 'bg-orange-100 text-orange-700 border-orange-200' },
  payment_submitted:  { label: 'Payment Submitted',  color: 'bg-blue-100 text-blue-700 border-blue-200'       },
  payment_confirmed:  { label: 'Payment Confirmed',  color: 'bg-green-100 text-green-700 border-green-200'    },
  coupon:             { label: 'Coupon Used',         color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

const STATUS_META: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number }> }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700 border-amber-200',   icon: Clock      },
  contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: PhoneCall  },
  approved:  { label: 'Approved',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  enrolled:  { label: 'Enrolled',  color: 'bg-violet-100 text-violet-700 border-violet-200', icon: UserCheck  },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-700 border-red-200',          icon: XCircle    },
  coupon:    { label: 'Coupon',    color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Tag        },
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
      <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{value || '—'}</p>
    </div>
  );

  const EditField = ({
    label, value, onChange, type = 'text',
  }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all"
        style={{ borderColor: '#E7DCCB', color: '#1F2937' }}
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
        className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ border: '1px solid #E7DCCB', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div className="sticky top-0 rounded-t-3xl px-6 pt-4 pb-0" style={{ backgroundColor: '#1F2937' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-black text-lg text-white">{reg.student.firstName} {reg.student.lastName}</p>
              <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{reg.registrationId}</p>
            </div>
            <button onClick={onClose} className="transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <X size={20} />
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {(['view', 'edit'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-xl transition-colors"
                style={tab === t ? { backgroundColor: '#FCF3E8', color: '#D97706' } : { color: 'rgba(255,255,255,0.6)' }}
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
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: '#D97706' }}><Pencil size={11} /> Student Information</h3>
                <div className="grid grid-cols-2 gap-4 rounded-2xl p-4" style={{ backgroundColor: '#FFFAF3', border: '1px solid #E7DCCB' }}>
                  <EditField label="First Name"    value={editStudent.firstName}   onChange={(v) => setEditStudent(s => ({ ...s, firstName: v }))} />
                  <EditField label="Last Name"     value={editStudent.lastName}    onChange={(v) => setEditStudent(s => ({ ...s, lastName: v }))} />
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Gender</label>
                    <select
                      value={editStudent.gender}
                      onChange={(e) => setEditStudent(s => ({ ...s, gender: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all"
                      style={{ borderColor: '#E7DCCB', color: '#1F2937' }}
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
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: '#D97706' }}><Pencil size={11} /> Parent Information</h3>
                <div className="grid grid-cols-2 gap-4 rounded-2xl p-4" style={{ backgroundColor: '#FFFAF3', border: '1px solid #E7DCCB' }}>
                  <div className="col-span-2">
                    <EditField label="Full Name"  value={editParent.fullName}   onChange={(v) => setEditParent(p => ({ ...p, fullName: v }))} />
                  </div>
                  <EditField label="Email"       value={editParent.email}      onChange={(v) => setEditParent(p => ({ ...p, email: v }))}      type="email" />
                  <EditField label="Phone"       value={editParent.phone}      onChange={(v) => setEditParent(p => ({ ...p, phone: v }))} />
                  <EditField label="WhatsApp"    value={editParent.whatsapp}   onChange={(v) => setEditParent(p => ({ ...p, whatsapp: v }))} />
                  <EditField label="Occupation"  value={editParent.occupation} onChange={(v) => setEditParent(p => ({ ...p, occupation: v }))} />
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Address</label>
                    <textarea
                      rows={2}
                      value={editParent.address}
                      onChange={(e) => setEditParent(p => ({ ...p, address: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] resize-none transition-all"
                      style={{ borderColor: '#E7DCCB', color: '#1F2937' }}
                    />
                  </div>
                </div>
              </section>

              {editError && <p className="text-red-500 text-xs px-1">{editError}</p>}

              <button
                onClick={saveInfo}
                disabled={editSaving}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-white font-bold rounded-2xl transition-all text-sm disabled:opacity-60"
                style={{ backgroundColor: '#D97706', boxShadow: '0 4px 12px rgba(217,119,6,0.25)' }}
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
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#D97706' }}>Student Information</h3>
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#FFFAF3', border: '1px solid #E7DCCB' }}>
              {/* Student Photo */}
              <div className="flex justify-center mb-4">
                {reg.student.photo ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={reg.student.photo}
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
                  <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}>
                    <span className="text-2xl font-black" style={{ color: '#D97706' }}>
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
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#D97706' }}>Parent Information</h3>
            <div className="grid grid-cols-2 gap-4 rounded-2xl p-4" style={{ backgroundColor: '#FFFAF3', border: '1px solid #E7DCCB' }}>
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
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#D97706' }}>Program & Schedule</h3>
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#FFFAF3', border: '1px solid #E7DCCB' }}>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Programs</p>
                <div className="flex flex-wrap gap-2">
                  {reg.programs.programs.map((p) => (
                    <span key={p} className="px-3 py-1 rounded-full text-xs font-bold capitalize" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>{p}</span>
                  ))}
                </div>
              </div>
              <Field label="Schedule"     value={reg.schedule?.schedule || 'Online (Free Program)'}  />
              <Field label="Payment Type" value={reg.payment.paymentType} />
              {reg.payment.selectedPlan && (
                <>
                  <Field 
                    label="Selected Plan" 
                    value={{
                      starter: 'Starter Plan (₦50,000) - 1 Month (4 Weeks)',
                      'stem-explorer': 'STEM Explorer Program (₦80,000) - 2 Months (8 Weeks)',
                      growth: 'Growth Plan (₦150,000) - 3 Months (12 Weeks)',
                      short: 'Short Program (₦100,000) - 2 Months (8 Weeks)',
                      mastery: 'Mastery Plan (₦250,000) - 6 Months (12 Weeks)',
                      platinum: 'Platinum Plan (₦300,000) - 6 Months (24 Weeks)',
                      'holiday-explorer': 'Holiday Explorer Track (₦50,000) - 1 Month Online',
                      'holiday-innovator': 'Holiday Innovator Track (₦80,000) - 2 Months Online',
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
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#D97706' }}>Admin Actions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6B7280' }}>Enrollment Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.filter(Boolean).map((s) => {
                    const meta = STATUS_META[s];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={s}
                        onClick={() => setStatus(s as Registration['status'])}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                          ${status === s ? meta.color + ' ring-2 ring-offset-1 ring-amber-400' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                      >
                        <Icon size={12} /> {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6B7280' }}>Payment Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['pending_payment', 'payment_submitted', 'payment_confirmed'] as const).map((ps) => {
                    const meta = PAYMENT_STATUS_META[ps];
                    return (
                      <button
                        key={ps}
                        onClick={() => setPaymentStatus(ps)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                          ${paymentStatus === ps ? meta.color + ' ring-2 ring-offset-1 ring-amber-400' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6B7280' }}>Internal Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this registration…"
                  className="w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] resize-none transition-all"
                  style={{ borderColor: '#E7DCCB', color: '#1F2937' }}
                />
              </div>

              {/* Confirm Enrollment CTA */}
              {!isEnrolled && (
                <div className="pt-2">
                  {enrollError && <p className="text-red-500 text-xs mb-2">{enrollError}</p>}
                  <button
                    onClick={confirmEnrollment}
                    disabled={enrolling}
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-white font-bold rounded-2xl transition-all text-sm disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
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
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl transition-colors"
                  style={{ border: '1px solid #FECACA', color: '#DC2626' }}
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 text-sm text-white font-bold rounded-xl transition-all"
                  style={{ backgroundColor: '#D97706', boxShadow: '0 3px 10px rgba(217,119,6,0.25)' }}
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
            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Registrations</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{pagination.total} total registration{pagination.total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={!!exporting}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl font-bold transition-colors"
              style={{ border: '1px solid #E7DCCB', color: '#6B7280' }}
            >
              {exporting === 'csv' ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
              CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              disabled={!!exporting}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white font-bold rounded-xl transition-all"
              style={{ backgroundColor: '#D97706', boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}
            >
              {exporting === 'xlsx' ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
              Export Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E7DCCB', boxShadow: '0 2px 8px rgba(215,119,6,0.05)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Filter size={13} style={{ color: '#D97706' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6B7280' }}>Filters</span>
            {hasFilters && (
              <button onClick={clearFilters} className="ml-auto text-xs font-bold flex items-center gap-1" style={{ color: '#D97706' }}>
                <X size={11} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search name, email, ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all"
                style={{ borderColor: '#E7DCCB', color: '#1F2937' }}
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all"
              style={{ borderColor: '#E7DCCB', color: '#1F2937' }}>
              <option value="">All Statuses</option>
              {STATUSES.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s === 'coupon' ? 'Coupon Registrations' : STATUS_META[s]?.label ?? s}</option>
              ))}
            </select>
            <select value={program} onChange={(e) => setProgram(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all capitalize"
              style={{ borderColor: '#E7DCCB', color: '#1F2937' }}>
              <option value="">All Programs</option>
              {PROGRAMS.filter(Boolean).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all"
              style={{ borderColor: '#E7DCCB', color: '#1F2937' }} />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all"
              style={{ borderColor: '#E7DCCB', color: '#1F2937' }} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7DCCB', boxShadow: '0 2px 8px rgba(215,119,6,0.05)' }}>
          {error ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ backgroundColor: '#FEF2F2' }}>
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="font-bold mb-1" style={{ color: '#DC2626' }}>Error Loading Data</p>
              <p className="text-sm max-w-md mx-auto" style={{ color: '#DC2626' }}>{error}</p>
            </div>
          ) : loading ? (
            <div className="p-8 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: '#F3E8D4' }} />
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-20 text-center" style={{ color: '#9CA3AF' }}>
              <Download size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold text-sm" style={{ color: '#6B7280' }}>No registrations found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
            {/* Mobile card list */}
            <div className="md:hidden" style={{ borderTop: '1px solid #E7DCCB' }}>
              {registrations.map((r) => {
                const meta = STATUS_META[r.status];
                const pmeta = PAYMENT_STATUS_META[r.paymentStatus ?? 'pending_payment'];
                return (
                  <div key={r._id} className="p-4 transition-colors" style={{ borderBottom: '1px solid #F3EADB' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: '#1F2937' }}>{r.student.firstName} {r.student.lastName}</p>
                        <p className="text-xs font-mono mt-0.5" style={{ color: '#9CA3AF' }}>{r.registrationId}</p>
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
                            <span key={p} className="px-2 py-0.5 rounded-full text-xs font-bold capitalize" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>{p}</span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => setSelected(r)}
                        className="flex-shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl transition-colors"
                        style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                        <Eye size={12} /> View
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
                  <tr className="text-left border-b" style={{ backgroundColor: '#FFFAF3', borderColor: '#E7DCCB' }}>
                    {['ID','Student','School','Programs','Schedule','Status','Payment','Registered',''].map((h, i) => (
                      <th key={i} className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider ${i >= 2 && i <= 4 ? (i === 4 ? 'hidden xl:table-cell' : 'hidden lg:table-cell') : ''} ${i === 6 ? 'hidden lg:table-cell' : ''} ${i === 7 ? 'hidden xl:table-cell' : ''} ${i === 8 ? 'text-right' : ''}`} style={{ color: '#9CA3AF' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => {
                    const meta = STATUS_META[r.status];
                    const Icon = meta?.icon;
                    return (
                      <tr key={r._id} className="transition-colors" style={{ borderBottom: '1px solid #F3EADB' }}>
                        <td className="px-5 py-4 font-mono text-xs" style={{ color: '#9CA3AF' }}>{r.registrationId}</td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-sm" style={{ color: '#1F2937' }}>{r.student.firstName} {r.student.lastName}</p>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>{r.parent.email}</p>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell text-xs" style={{ color: '#6B7280' }}>{r.student.schoolName}</td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {r.programs.programs.slice(0, 2).map((p) => (
                              <span key={p} className="px-2 py-0.5 rounded-full text-xs font-bold capitalize" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>{p}</span>
                            ))}
                            {r.programs.programs.length > 2 && (
                              <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>+{r.programs.programs.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden xl:table-cell text-xs capitalize" style={{ color: '#6B7280' }}>{r.schedule?.schedule || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${meta?.color ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {Icon && <Icon size={11} />} {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <div className="flex flex-col gap-1">
                            {r.payment?.coupon ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border bg-purple-100 text-purple-700 border-purple-200">
                                <Tag size={10} /> Coupon: {r.payment.coupon}
                              </span>
                            ) : (
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${PAYMENT_STATUS_META[r.paymentStatus ?? 'pending_payment']?.color ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                {PAYMENT_STATUS_META[r.paymentStatus ?? 'pending_payment']?.label ?? 'Pending Payment'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden xl:table-cell text-xs" style={{ color: '#9CA3AF' }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => setSelected(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-colors"
                            style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>
                            <Eye size={12} /> View
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
            <div className="flex items-center justify-between px-5 py-4 text-xs" style={{ borderTop: '1px solid #E7DCCB', color: '#9CA3AF' }}>
              <span>Page {pagination.page} of {pagination.pages} ({pagination.total} records)</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: '1px solid #E7DCCB', color: '#6B7280' }}>
                  <ChevronLeft size={15} />
                </button>
                <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                  className="p-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: '1px solid #E7DCCB', color: '#6B7280' }}>
                  <ChevronRight size={15} />
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
