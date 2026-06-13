import { z } from 'zod';

const ALLOWED_PROGRAMS = [
  'coding', 'robotics', 'ai', 'web', 'mobile', 'game', '3d', 'graphic', 'digital', 'scratch',
] as const;

export const studentSchema = z.object({
  firstName:   z.string().min(2, 'First name must be at least 2 characters').max(60),
  lastName:    z.string().min(2, 'Last name must be at least 2 characters').max(60),
  gender:      z.enum(['male', 'female', 'other'], { message: 'Please select a gender' }),
  dateOfBirth: z.string().min(1, 'Date of birth is required').max(20),
  schoolName:  z.string().min(2, 'School name is required').max(120),
  classGrade:  z.string().min(1, 'Class/Grade is required').max(30),
  photo:       z.any().optional(),
});

export const parentSchema = z.object({
  fullName:   z.string().min(3, 'Full name must be at least 3 characters').max(120),
  email:      z.string().email('Please enter a valid email address').max(254),
  phone:      z.string().min(10, 'Phone number must be at least 10 digits').max(20),
  whatsapp:   z.string().min(10, 'WhatsApp number must be at least 10 digits').max(20),
  address:    z.string().min(10, 'Address must be at least 10 characters').max(300),
  occupation: z.string().min(2, 'Occupation is required').max(100),
});

export const programSchema = z.object({
  programs: z
    .array(z.enum(ALLOWED_PROGRAMS, { message: 'Invalid program selected' }))
    .min(1, 'Please select at least one program')
    .max(10),
});

export const scheduleSchema = z.object({
  schedule: z.enum(['weekend', 'after-school', 'holiday', 'private'], {
    message: 'Please select a schedule preference',
  }),
});

export const paymentSchema = z.object({
  paymentType: z.enum(['full', 'installment']).optional(),
  coupon: z.string().max(50).optional(),
  selectedPlan: z.enum(['growth', 'short', 'mastery', 'platinum']).optional(),
}).refine(
  (data) => {
    // If coupon is provided, paymentType is optional
    // If no coupon, paymentType OR selectedPlan indicates payment preference
    const hasCoupon = data.coupon && data.coupon.trim() !== '';
    const hasPaymentType = data.paymentType !== undefined;
    return hasCoupon || hasPaymentType;
  },
  {
    message: 'Please select a payment option',
    path: ['paymentType'],
  }
);

export const registrationSchema = z.object({
  student: studentSchema,
  parent: parentSchema,
  programs: programSchema,
  schedule: scheduleSchema,
  payment: paymentSchema,
}).refine(
  (data) => {
    // On final submission, require selectedPlan if no coupon
    const hasCoupon = data.payment.coupon && data.payment.coupon.trim() !== '';
    return hasCoupon || data.payment.selectedPlan !== undefined;
  },
  {
    message: 'Please select a pricing plan before submitting',
    path: ['payment', 'selectedPlan'],
  }
);

export type RegistrationFormData = z.infer<typeof registrationSchema>;
