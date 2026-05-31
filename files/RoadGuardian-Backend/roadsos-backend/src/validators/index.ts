import { z } from 'zod';

// ============================
// AUTH VALIDATORS
// ============================

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase(),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

// ============================
// USER VALIDATORS
// ============================

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/).optional(),
});

// ============================
// SOS VALIDATORS
// ============================

export const createSosSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  emergencyType: z.enum(['HOSPITAL', 'AMBULANCE', 'POLICE', 'TOWING', 'RESCUE']),
  description: z.string().max(500).optional(),
});

// ============================
// EMERGENCY CONTACT VALIDATORS
// ============================

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  relationship: z.string().min(2).max(50),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number'),
  email: z.string().email().optional().or(z.literal('')),
});

// ============================
// QUERY VALIDATORS
// ============================

export const paginationSchema = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const nearbySchema = z.object({
  latitude: z.string().transform(Number),
  longitude: z.string().transform(Number),
  radius: z.string().default('10').transform(Number),
  type: z.enum(['HOSPITAL', 'AMBULANCE', 'POLICE', 'TOWING', 'RESCUE', 'PHARMACY', 'BLOOD_BANK']).optional(),
});

// ============================
// VALIDATION MIDDLEWARE
// ============================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return next({ statusCode: 400, message: 'Validation failed', errors, isOperational: true });
    }
    req[source] = result.data;
    next();
  };
};
