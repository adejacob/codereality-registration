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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Parent Information
      </h2>
      
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Home Address
          </label>
          <textarea
            {...register('parent.address')}
            placeholder="Enter your full home address"
            rows={3}
            className={`w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${getError('address') ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {getError('address') && (
            <p className="mt-1 text-sm text-red-500">{getError('address')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
