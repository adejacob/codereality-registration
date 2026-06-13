'use client';

import { useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Camera, X, Upload, User } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';

export default function StudentInfoStep() {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photo = watch('student.photo');

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const getError = (field: string) => {
    const error = errors.student as any;
    return error?.[field]?.message as string;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Set value in form
      setValue('student.photo', file, { shouldValidate: true });
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    setValue('student.photo', undefined, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setValue('student.photo', file, { shouldValidate: true });
    }
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

      {/* Photo Upload Section */}
      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <span className="flex items-center gap-2">
            <Camera size={18} className="text-indigo-500" />
            Student Photo <span className="text-gray-400 font-normal">(Optional)</span>
          </span>
        </label>
        
        {previewUrl ? (
          /* Photo Preview */
          <div className="relative w-48 h-48 mx-auto">
            <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-indigo-100 shadow-lg">
              <img
                src={previewUrl}
                alt="Student preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
            >
              <X size={16} />
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              Click the X to remove and upload a different photo
            </p>
          </div>
        ) : (
          /* Upload Area */
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 transition-all duration-300">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
