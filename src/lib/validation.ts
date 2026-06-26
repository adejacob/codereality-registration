import { z } from 'zod';

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
    .array(z.string().min(1))
    .min(1, 'Please select at least one program')
    .max(20),
});

export const scheduleSchema = z.object({
  schedule: z.enum(['weekend', 'after-school', 'holiday', 'private'], {
    message: 'Please select a schedule preference',
  }).optional(),
});

export const paymentSchema = z.object({
  paymentType: z.enum(['full', 'installment']).optional(),
  coupon: z.string().max(50).optional(),
  selectedPlan: z.string().min(1).optional(),
});

export const registrationSchema = z.object({
  student: studentSchema,
  parent: parentSchema,
  programs: programSchema,
  schedule: scheduleSchema,
  payment: paymentSchema,
}).refine(
  (data) => {
    // selectedPlan not required when:
    // 1. A coupon is provided (free / workshop registrations), OR
    // 2. No schedule was selected (free program that skips schedule+pricing steps)
    const hasCoupon = data.payment.coupon && data.payment.coupon.trim() !== '';
    const hasNoSchedule = !data.schedule.schedule;
    return hasCoupon || hasNoSchedule || data.payment.selectedPlan !== undefined;
  },
  {
    message: 'Please select a pricing plan before submitting',
    path: ['payment', 'selectedPlan'],
  }
);

export type RegistrationFormData = z.infer<typeof registrationSchema>;
