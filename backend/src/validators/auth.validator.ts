import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const signupSchema = z.object({
  body: z.object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters')
      .trim(),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format')
      .trim(),
    password: passwordSchema,
    
    // Mandatory details
    bloodGroup: z
      .string({ required_error: 'Blood group is required' })
      .min(1, 'Blood group is required')
      .trim(),
    vehicleNumber: z
      .string({ required_error: 'Vehicle number is required' })
      .min(1, 'Vehicle number is required')
      .trim(),
    contactName: z
      .string({ required_error: 'Primary emergency contact name is required' })
      .min(1, 'Primary emergency contact name is required')
      .trim(),
    contactRelation: z
      .string({ required_error: 'Primary emergency contact relation is required' })
      .min(1, 'Primary emergency contact relation is required')
      .trim(),
    contactPhone: z
      .string({ required_error: 'Primary emergency contact phone is required' })
      .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid emergency contact phone number format')
      .trim(),
      
    // Secondary emergency contact (optional)
    secondaryContactName: z.string().trim().optional(),
    secondaryContactRelation: z.string().trim().optional(),
    secondaryContactPhone: z.string().trim().optional(),
    
    // Recommended / Optional details
    address: z.string().trim().optional(),
    gender: z.string().trim().optional(),
    dob: z.string().trim().optional(),
    dlNumber: z.string().trim().optional(),
    vehicleType: z.string().trim().optional(),
    vehicleModel: z.string().trim().optional(),
    medicalConditions: z.string().trim().optional(),
    currentMedications: z.string().trim().optional(),
    disabilityInfo: z.string().trim().optional(),
    aadhaar: z.string().trim().optional(),
    insurance: z.string().trim().optional(),
    organDonor: z.string().trim().optional(),
    allergies: z.string().trim().optional(),
    avatar: z.string().trim().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
    password: z.string({ required_error: 'Password is required' }).min(1),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: passwordSchema,
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    purpose: z
      .enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET'])
      .default('EMAIL_VERIFICATION'),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
    purpose: z
      .enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET'])
      .default('EMAIL_VERIFICATION'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: 'Current password is required' }),
    newPassword: passwordSchema,
  }),
});

export type SignupInput = z.infer<typeof signupSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
