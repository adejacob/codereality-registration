'use client';

import { useFormContext } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, CreditCard, Tag, CheckCircle } from 'lucide-react';
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
  };

  const planNames: Record<string, string> = {
    growth: 'Growth Plan',
    short: 'Short Program',
    mastery: 'Mastery Plan',
    platinum: 'Platinum Plan',
  };

  const selectedPrograms = formData.programs?.programs || [];
  const selectedProgramNames = selectedPrograms.map((id: string) => 
    programs.find(p => p.id === id)?.name || id
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Review Your Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="text-indigo-600" size={20} />
            Student Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formData.student?.firstName} {formData.student?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">
                {formData.student?.gender}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formData.student?.dateOfBirth}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">School</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formData.student?.schoolName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Class/Grade</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formData.student?.classGrade}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="text-indigo-600" size={20} />
            Parent Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formData.parent?.fullName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="text-gray-400" size={16} />
              <p className="font-medium text-gray-900 dark:text-white">
                {formData.parent?.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-gray-400" size={16} />
              <p className="font-medium text-gray-900 dark:text-white">
                {formData.parent?.phone}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-gray-400" size={16} />
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {formData.parent?.address}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="text-gray-400" size={16} />
              <p className="font-medium text-gray-900 dark:text-white">
                {formData.parent?.occupation}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="text-indigo-600" size={20} />
            Programs & Schedule
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected Programs</p>
              <div className="flex flex-wrap gap-2">
                {selectedProgramNames.map((name: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Schedule</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {schedules[formData.schedule?.schedule as keyof typeof schedules]}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="text-indigo-600" size={20} />
            Payment Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Payment Type</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {payments[formData.payment?.paymentType as keyof typeof payments]}
              </p>
            </div>
            {formData.payment?.selectedPlan && !formData.payment?.coupon && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Selected Plan</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {planNames[formData.payment.selectedPlan]}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Plan Amount</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {planAmounts[formData.payment.selectedPlan]}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Registration Fee</span>
                  <span className="font-medium text-gray-900 dark:text-white">₦5,000</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-white">Total Amount</span>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">
                      {(() => {
                        const planAmount = parseInt(planAmounts[formData.payment!.selectedPlan!].replace(/[^0-9]/g, ''));
                        return `₦${(planAmount + 5000).toLocaleString()}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {formData.payment?.coupon && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Coupon Code</p>
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <Tag className="text-amber-600" size={16} />
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400 uppercase">
                    {formData.payment.coupon}
                  </span>
                  <CheckCircle className="text-green-500" size={14} />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Discount will be applied at checkout
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
