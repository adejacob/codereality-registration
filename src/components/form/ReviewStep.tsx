'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, CreditCard, Tag, CheckCircle, 
  GraduationCap, DollarSign, Award, Camera, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

export default function ReviewStep() {
  const { watch } = useFormContext();
  const formData = watch();

  const programs = [
    { id: 'coding', name: 'Coding & Programming' },
    { id: 'robotics', name: 'Robotics Engineering' },
    { id: 'ai', name: 'Artificial Intelligence' },
    { id: 'web', name: 'Web Development' },
    { id: 'mobile', name: 'Mobile App Development' },
    { id: 'game', name: 'Game Development' },
    { id: '3d', name: '3D Design & Modeling' },
    { id: 'graphic', name: 'Graphic Design' },
    { id: 'digital', name: 'Digital Literacy' },
    { id: 'scratch', name: 'Scratch Programming' },
  ];

  const schedules = {
    weekend: 'Weekend Classes',
    'after-school': 'After School Classes',
    holiday: 'Holiday Bootcamp',
    private: 'Private Coaching',
  };

  const payments = {
    full: 'Full Payment',
    installment: 'Installment Plan',
  };

  const planAmounts: Record<string, string> = {
    growth: '₦150,000',
    short: '₦100,000',
    mastery: '₦250,000',
    platinum: '₦300,000',
    'holiday-explorer': '₦50,000',
    'holiday-innovator': '₦80,000',
  };

  const planNames: Record<string, string> = {
    growth: 'Growth Plan',
    short: 'Short Program',
    mastery: 'Mastery Plan',
    platinum: 'Platinum Plan',
    'holiday-explorer': 'Holiday Explorer Track',
    'holiday-innovator': 'Holiday Innovator Track',
  };

  const selectedPrograms = formData.programs?.programs || [];
  const selectedProgramNames = selectedPrograms.map((id: string) => 
    programs.find(p => p.id === id)?.name || id
  );

  // Get photo preview URL
  const photoPreview = useMemo(() => {
    const photo = formData.student?.photo;
    if (photo instanceof File) {
      return URL.createObjectURL(photo);
    }
    return null;
  }, [formData.student?.photo]);

  const InfoRow = ({ label, value, icon: Icon, highlight = false }: any) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
      {Icon && <Icon size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-medium truncate ${highlight ? 'text-green-600 dark:text-green-400 text-lg' : 'text-gray-900 dark:text-white'}`}>
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"
        >
          <FileText className="w-8 h-8 text-green-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Review Your Registration
        </h2>
        <p className="text-gray-500 mt-2">
          Please verify all information before submitting
        </p>
      </div>

      {/* Student Info Card with Photo */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <GraduationCap size={20} />
            Student Information
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            {photoPreview ? (
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-indigo-100 shadow-lg">
                  <img
                    src={photoPreview}
                    alt="Student"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-2xl bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">No photo uploaded</p>
              </div>
            )}
            
            {/* Student Details */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <InfoRow 
                label="Full Name" 
                value={`${formData.student?.firstName} ${formData.student?.lastName}`} 
              />
              <InfoRow 
                label="Gender" 
                value={formData.student?.gender?.charAt(0).toUpperCase() + formData.student?.gender?.slice(1)} 
              />
              <InfoRow 
                label="Date of Birth" 
                value={formData.student?.dateOfBirth} 
              />
              <InfoRow 
                label="Class/Grade" 
                value={formData.student?.classGrade} 
              />
              <InfoRow 
                label="School" 
                value={formData.student?.schoolName}
                className="col-span-2"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parent Info */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User size={20} />
              Parent Information
            </h3>
          </div>
          <div className="p-5">
            <InfoRow label="Full Name" value={formData.parent?.fullName} icon={User} />
            <InfoRow label="Email Address" value={formData.parent?.email} icon={Mail} />
            <InfoRow label="Phone Number" value={formData.parent?.phone} icon={Phone} />
            <InfoRow label="WhatsApp" value={formData.parent?.whatsapp} icon={Phone} />
            <InfoRow label="Address" value={formData.parent?.address} icon={MapPin} />
            <InfoRow label="Occupation" value={formData.parent?.occupation} icon={Briefcase} />
          </div>
        </Card>

        {/* Programs & Schedule */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar size={20} />
              Programs & Schedule
            </h3>
          </div>
          <div className="p-5">
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Selected Programs</p>
              <div className="flex flex-wrap gap-2">
                {selectedProgramNames.map((name: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200"
                  >
                    <Award size={14} className="mr-1.5" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <InfoRow label="Schedule Preference" value={schedules[formData.schedule?.schedule as keyof typeof schedules]} icon={Calendar} />
          </div>
        </Card>
      </div>

      {/* Payment Summary - Full Width */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CreditCard size={20} />
            Payment Summary
          </h3>
        </div>
        <div className="p-6">
          {formData.payment?.coupon ? (
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Free Registration Applied</p>
                <div className="flex items-center gap-2 mt-1">
                  <Tag size={16} className="text-amber-600" />
                  <span className="font-mono font-bold text-amber-700 uppercase">{formData.payment.coupon}</span>
                </div>
              </div>
            </div>
          ) : formData.payment?.selectedPlan ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-semibold text-gray-900">{payments[formData.payment?.paymentType as keyof typeof payments]}</p>
                </div>
              </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Selected Plan</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{planNames[formData.payment.selectedPlan]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Plan Duration</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formData.payment.selectedPlan === 'growth' && '3 Months'}
                    {formData.payment.selectedPlan === 'short' && '2 Months'}
                    {formData.payment.selectedPlan === 'mastery' && '6 Months'}
                    {formData.payment.selectedPlan === 'platinum' && '6 Months'}
                    {formData.payment.selectedPlan === 'holiday-explorer' && '1 Month (Online)'}
                    {formData.payment.selectedPlan === 'holiday-innovator' && '2 Months (Online)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Plan Amount</span>
                  <span className="font-semibold text-gray-900">{planAmounts[formData.payment.selectedPlan]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Registration Fee</span>
                  <span className="font-semibold text-gray-900">₦5,000</span>
                </div>
                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {(() => {
                        const planAmount = parseInt(planAmounts[formData.payment!.selectedPlan!].replace(/[^0-9]/g, ''));
                        return `₦${(planAmount + 5000).toLocaleString()}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No payment information available</p>
          )}
        </div>
      </Card>
    </div>
  );
}
