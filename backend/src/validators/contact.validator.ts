import { z } from 'zod';

export const createContactSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100)
      .trim(),
    relationship: z
      .string({ required_error: 'Relationship is required' })
      .min(2)
      .max(50)
      .trim(),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
    email: z.string().email('Invalid email address').optional(),
  }),
});

export const updateContactSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid contact ID'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    relationship: z.string().min(2).max(50).trim().optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format')
      .optional(),
    email: z.string().email('Invalid email address').optional(),
  }),
});

export type CreateContactInput = z.infer<typeof createContactSchema>['body'];
export type UpdateContactInput = z.infer<typeof updateContactSchema>['body'];
