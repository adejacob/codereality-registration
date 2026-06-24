import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRegistration extends Document {
  student: {
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
    schoolName: string;
    classGrade: string;
    photo?: string;
  };
  parent: {
    fullName: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    occupation: string;
  };
  programs: {
    programs: string[];
  };
  schedule: {
    schedule: 'weekend' | 'after-school' | 'holiday' | 'private';
  };
  payment: {
    paymentType: 'full' | 'installment';
    coupon?: string;
    selectedPlan?: 'starter' | 'stem-explorer' | 'growth' | 'short' | 'mastery' | 'platinum' | 'holiday-explorer' | 'holiday-innovator';
  };
  status: 'pending' | 'contacted' | 'approved' | 'enrolled' | 'rejected';
  paymentStatus: 'pending_payment' | 'payment_submitted' | 'payment_confirmed';
  notes: string;
  registrationId: string;
  enrollmentNumber?: string;
  enrollmentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    student: {
      firstName: { type: String, required: true, trim: true },
      lastName:  { type: String, required: true, trim: true },
      gender:    { type: String, enum: ['male', 'female', 'other'], required: true },
      dateOfBirth: { type: String, required: true },
      schoolName:  { type: String, required: true, trim: true },
      classGrade:  { type: String, required: true, trim: true },
      photo:       { type: String },
    },
    parent: {
      fullName:   { type: String, required: true, trim: true },
      email:      { type: String, required: true, lowercase: true, trim: true },
      phone:      { type: String, required: true, trim: true },
      whatsapp:   { type: String, required: true, trim: true },
      address:    { type: String, required: true, trim: true },
      occupation: { type: String, required: true, trim: true },
    },
    programs: {
      programs: { type: [String], required: true },
    },
    schedule: {
      schedule: {
        type: String,
        enum: ['weekend', 'after-school', 'holiday', 'private'],
        required: true,
      },
    },
    payment: {
      paymentType: { type: String, enum: ['full', 'installment'], required: true },
      coupon:      { type: String },
      selectedPlan: {
        type: String,
        enum: ['starter', 'stem-explorer', 'growth', 'short', 'mastery', 'platinum', 'holiday-explorer', 'holiday-innovator'],
      },
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'approved', 'enrolled', 'rejected'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending_payment', 'payment_submitted', 'payment_confirmed'],
      default: 'pending_payment',
    },
    notes: {
      type: String,
      default: '',
    },
    enrollmentNumber: {
      type: String,
      sparse: true,
    },
    enrollmentDate: {
      type: Date,
    },
    registrationId: {
      type: String,
      unique: true,
      default: () => {
        const year = new Date().getFullYear();
        const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `CRA-${year}-${rand}`;
      },
    },
  },
  { timestamps: true }
);

const Registration: Model<IRegistration> =
  mongoose.models.Registration ??
  mongoose.model<IRegistration>('Registration', RegistrationSchema);

export default Registration;
