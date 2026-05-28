import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100)
      .trim()
      .optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format')
      .trim()
      .optional(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
