'use client';

import { useFormContext } from 'react-hook-form';
import Input from '../ui/Input';

export default function ParentInfoStep() {
  const { register, formState: { errors } } = useFormContext();

  const getError = (field: string) => {
    const error = errors.parent as any;
    return error?.[field]?.message as string;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Parent / Guardian Information</h2>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>We&apos;ll use these details to keep you informed.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Parent Full Name"
          placeholder="Enter your full name"
          error={getError('fullName')}
          {...register('parent.fullName')}
        />
        
        <Input
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          error={getError('email')}
          {...register('parent.email')}
        />
        
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+234 XXX XXX XXXX"
          error={getError('phone')}
          {...register('parent.phone')}
        />
        
        <Input
          label="WhatsApp Number"
          type="tel"
          placeholder="+234 XXX XXX XXXX"
          error={getError('whatsapp')}
          {...register('parent.whatsapp')}
        />
        
        <Input
          label="Occupation"
          placeholder="Enter your occupation"
          error={getError('occupation')}
          {...register('parent.occupation')}
          className="md:col-span-2"
        />
        
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 reg-label" style={{ color: '#1F2937' }}>Home Address</label>
          <textarea
            {...register('parent.address')}
            placeholder="Enter your full home address"
            rows={3}
            className={`w-full px-4 py-3.5 rounded-2xl border bg-white text-base placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all duration-200 resize-none reg-input ${getError('address') ? 'border-red-400 focus:ring-red-400' : 'border-[#E7DCCB] hover:border-[#D97706]/50'}`}
            style={{ color: '#1F2937' }}
          />
          {getError('address') && (
            <p className="mt-1 text-sm text-red-500">{getError('address')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
