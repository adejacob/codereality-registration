'use client';

import { useMemo, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, CreditCard, Tag, CheckCircle, 
  GraduationCap, DollarSign, Award, Camera, AlertTriangle
} from 'lucide-react';
import { calcInstallmentFromFee, formatNaira, REGISTRATION_FEE } from '@/lib/installment';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

export default function ReviewStep() {
  const { watch } = useFormContext();
  const formData = watch();

  const [apiPrograms, setApiPrograms] = useState<{ id: string; name: string }[]>([]);
  const [apiPlans, setApiPlans] = useState<{ id: string; name: string; fee: number; installmentEligible: boolean }[]>([]);
  useEffect(() => {
    fetch('/api/programs')
      .then(r => r.json())
      .then(d => { if (d.success) setApiPrograms(d.data); })
      .catch(() => {});
    fetch('/api/plans-config')
      .then(r => r.json())
      .then(d => { if (d.success) setApiPlans(d.data); })
      .catch(() => {});
  }, []);

  const schedules = {
    weekend: 'Weekend Classes',
    'after-school': 'After School Classes',
    holiday: 'Holiday Bootcamp',
    private: 'Private Coaching',
  };

  const payments = {
    full: 'Full Payment',
    installment: 'Installment (50%)',
  };

  const selectedPlanId = formData.payment?.selectedPlan as string | undefined;
  const apiPlan = apiPlans.find(p => p.id === selectedPlanId);

  const isInstallment = formData.payment?.paymentType === 'installment';
  const isInstallmentEligible = apiPlan ? apiPlan.installmentEligible : false;

  const selectedPrograms = formData.programs?.programs || [];
  const selectedProgramNames = selectedPrograms.map((id: string) =>
    apiPrograms.find(p => p.id === id)?.name || id
  );

  // Get photo preview URL
  const photoPreview = useMemo(() => {
    const photo = formData.student?.photo;
    if (photo instanceof File) {
      return URL.createObjectURL(photo);
    }
    return null;
  }, [formData.student?.photo]);

  const InfoRow = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-start gap-3 py-2.5 last:pb-0" style={{ borderBottom: '1px solid #F3E8D4' }}>
      {Icon && <Icon size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#D97706' }} />}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{label}</p>
        <p className="text-sm font-semibold mt-0.5 break-words" style={{ color: '#1F2937' }}>{value || '—'}</p>
      </div>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, color }: any) => (
    <div className="px-5 py-3.5 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`, borderBottom: '1px solid #E7DCCB' }}>
      <div className="p-1.5 rounded-lg" style={{ backgroundColor: color }}>
        <Icon size={14} className="text-white" />
      </div>
      <h3 className="font-black text-sm tracking-tight" style={{ color: '#1F2937' }}>{title}</h3>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Review Your Registration</h2>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Please verify all information before submitting.</p>
      </div>

      {/* Student Info Card with Photo */}
      <Card className="overflow-hidden">
        <SectionHeader icon={GraduationCap} title="Student Information" color="#D97706" />
        <div className="p-5">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Photo */}
            <div className="flex-shrink-0 flex flex-col items-center">
              {photoPreview ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md" style={{ border: '2px solid #E7DCCB' }}>
                  <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#FCF3E8', border: '2px dashed #E7DCCB' }}>
                  <Camera className="w-8 h-8" style={{ color: '#D97706' }} />
                </div>
              )}
              <p className="text-[10px] mt-1.5 text-center" style={{ color: '#9CA3AF' }}>{photoPreview ? 'Photo uploaded' : 'No photo'}</p>
            </div>
            {/* Details */}
            <div className="flex-1 grid grid-cols-2 gap-x-4">
              <InfoRow label="Full Name" value={`${formData.student?.firstName} ${formData.student?.lastName}`} />
              <InfoRow label="Gender" value={formData.student?.gender?.charAt(0).toUpperCase() + formData.student?.gender?.slice(1)} />
              <InfoRow label="Date of Birth" value={formData.student?.dateOfBirth} />
              <InfoRow label="Class/Grade" value={formData.student?.classGrade} />
              <InfoRow label="School" value={formData.student?.schoolName} />
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Parent Info */}
        <Card className="overflow-hidden">
          <SectionHeader icon={User} title="Parent / Guardian" color="#C2410C" />
          <div className="p-5 space-y-0">
            <InfoRow label="Full Name" value={formData.parent?.fullName} icon={User} />
            <InfoRow label="Email" value={formData.parent?.email} icon={Mail} />
            <InfoRow label="Phone" value={formData.parent?.phone} icon={Phone} />
            <InfoRow label="WhatsApp" value={formData.parent?.whatsapp} icon={Phone} />
            <InfoRow label="Address" value={formData.parent?.address} icon={MapPin} />
            <InfoRow label="Occupation" value={formData.parent?.occupation} icon={Briefcase} />
          </div>
        </Card>

        {/* Programs & Schedule */}
        <Card className="overflow-hidden">
          <SectionHeader icon={Calendar} title="Programs & Schedule" color="#D97706" />
          <div className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Selected Programs</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedProgramNames.map((name: string, index: number) => (
                <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>
                  <Award size={11} /> {name}
                </span>
              ))}
            </div>
            <InfoRow label="Schedule" value={formData.schedule?.schedule ? schedules[formData.schedule.schedule as keyof typeof schedules] : 'Online (Free Program)'} icon={Calendar} />
          </div>
        </Card>
      </div>

      {/* Payment Summary */}
      <Card className="overflow-hidden">
        <SectionHeader icon={CreditCard} title="Payment Summary" color="#15803D" />
        <div className="p-5">
          {formData.payment?.coupon ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}>
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#15803D' }}><CheckCircle size={18} className="text-white" /></div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#14532D' }}>Free Registration</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Tag size={12} style={{ color: '#D97706' }} />
                  <span className="font-mono font-bold text-xs uppercase" style={{ color: '#D97706' }}>{formData.payment.coupon}</span>
                </div>
              </div>
            </div>
          ) : formData.payment?.selectedPlan ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #E7DCCB' }}>
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: isInstallment ? '#DBEAFE' : '#FEF3C7' }}>
                  <DollarSign size={14} style={{ color: isInstallment ? '#1D4ED8' : '#D97706' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Payment Method</p>
                  <p className="font-bold text-sm" style={{ color: isInstallment ? '#1D4ED8' : '#1F2937' }}>
                    {payments[formData.payment?.paymentType as keyof typeof payments] || 'Full Payment'}
                  </p>
                </div>
              </div>

              {isInstallment && isInstallmentEligible ? (() => {
                const bd = calcInstallmentFromFee(apiPlan!.fee);
                return (
                  <>
                    <div className="rounded-2xl p-4 space-y-2.5" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                      {[
                        { label: 'Selected Plan', value: apiPlan?.name ?? selectedPlanId ?? '' },
                        { label: 'Program Fee (Full)', value: formatNaira(bd.planFee) },
                        { label: '50% Due Today', value: formatNaira(bd.halfPlanFee) },
                        { label: 'Registration Fee', value: formatNaira(REGISTRATION_FEE) },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: '#6B7280' }}>{label}</span>
                          <span className="font-semibold text-sm" style={{ color: '#1F2937' }}>{value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2.5" style={{ borderTop: '2px solid #BFDBFE' }}>
                        <span className="font-bold" style={{ color: '#1D4ED8' }}>Amount Payable Today</span>
                        <span className="text-xl font-black" style={{ color: '#1D4ED8' }}>{formatNaira(bd.amountDueToday)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: '#6B7280' }}>Outstanding Balance</span>
                        <span className="font-bold text-sm" style={{ color: '#DC2626' }}>{formatNaira(bd.outstandingBalance)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: '#6B7280' }}>Balance Due By</span>
                        <span className="font-semibold text-sm" style={{ color: '#DC2626' }}>End of 1st Month</span>
                      </div>
                    </div>
                    <div className="rounded-xl p-3 flex items-start gap-2" style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
                      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
                      <p className="text-xs leading-relaxed" style={{ color: '#78350F' }}>
                        You are paying <strong>50% of the program fee plus the registration fee</strong> today.
                        The remaining balance must be paid <strong>on or before the end of your child's first month of enrollment</strong>.
                        Failure to pay by this deadline will result in classes being placed on hold.
                      </p>
                    </div>
                  </>
                );
              })() : (
              <div className="rounded-2xl p-4 space-y-2.5" style={{ backgroundColor: '#FFFAF3', border: '1px solid #E7DCCB' }}>
                {[
                  { label: 'Selected Plan', value: apiPlan?.name ?? selectedPlanId ?? '' },
                  { label: 'Plan Amount', value: apiPlan ? formatNaira(apiPlan.fee) : '' },
                  { label: 'Registration Fee', value: formatNaira(REGISTRATION_FEE) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: '#6B7280' }}>{label}</span>
                    <span className="font-semibold text-sm" style={{ color: '#1F2937' }}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2.5" style={{ borderTop: '2px solid #E7DCCB' }}>
                  <span className="font-bold" style={{ color: '#1F2937' }}>Total Amount</span>
                  <span className="text-xl font-black" style={{ color: '#15803D' }}>
                    {formatNaira((apiPlan?.fee ?? 0) + REGISTRATION_FEE)}
                  </span>
                </div>
              </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}>
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#15803D' }}><CheckCircle size={18} className="text-white" /></div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#14532D' }}>Free Program Registration</p>
                <p className="text-xs mt-0.5" style={{ color: '#166534' }}>No payment required for this program.</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
