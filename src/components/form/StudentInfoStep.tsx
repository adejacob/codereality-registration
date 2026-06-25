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
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Student Information</h2>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Tell us about your child joining the academy.</p>
      </div>
      
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
        <label className="block text-sm font-semibold mb-3" style={{ color: '#1F2937' }}>
          <span className="flex items-center gap-2">
            <Camera size={16} style={{ color: '#D97706' }} />
            Student Photo <span className="text-xs font-normal" style={{ color: '#9CA3AF' }}>(Optional)</span>
          </span>
        </label>
        
        {previewUrl ? (
          /* Photo Preview */
          <div className="relative w-48 h-48 mx-auto">
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg" style={{ border: '3px solid #E7DCCB' }}>
              <img
                src={previewUrl}
                alt="Student preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 p-1.5 text-white rounded-full transition-colors shadow-md"
              style={{ backgroundColor: '#C2410C' }}
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
            <div
              className="flex flex-col items-center justify-center w-full h-44 rounded-2xl transition-all duration-300"
              style={{ border: '2px dashed #E7DCCB', backgroundColor: '#FFFAF3' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#D97706'; (e.currentTarget as HTMLDivElement).style.backgroundColor = '#FDF0DC'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E7DCCB'; (e.currentTarget as HTMLDivElement).style.backgroundColor = '#FFFAF3'; }}
            >
              <div className="p-3 rounded-full mb-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#FDE68A' }}>
                <Upload className="w-7 h-7" style={{ color: '#D97706' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>Click to upload or drag &amp; drop</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>PNG, JPG up to 10MB</p>
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
