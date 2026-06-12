'use client';

import { useFormContext } from 'react-hook-form';
import Input from '../ui/Input';
import Select from '../ui/Select';

export default function StudentInfoStep() {
  const { register, formState: { errors } } = useFormContext();

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const getError = (field: string) => {
    const error = errors.student as any;
    return error?.[field]?.message as string;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Student Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Student First Name"
          placeholder="Enter first name"
          error={getError('firstName')}
          {...register('student.firstName')}
        />
        
        <Input
          label="Student Last Name"
          placeholder="Enter last name"
          error={getError('lastName')}
          {...register('student.lastName')}
        />
        
        <Select
          label="Gender"
          options={genderOptions}
          error={getError('gender')}
          {...register('student.gender')}
        />
        
        <Input
          label="Date of Birth"
          type="date"
          error={getError('dateOfBirth')}
          {...register('student.dateOfBirth')}
        />
        
        <Input
          label="School Name"
          placeholder="Enter current school"
          error={getError('schoolName')}
          {...register('student.schoolName')}
        />
        
        <Input
          label="Class/Grade"
          placeholder="e.g., Grade 5, JSS 2"
          error={getError('classGrade')}
          {...register('student.classGrade')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Student Photo (Optional)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-indigo-500 transition-colors">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label
                htmlFor="photo-upload"
                className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span>Upload a file</span>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
