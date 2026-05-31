import { z } from 'zod';

export const createSosSchema = z.object({
  body: z.object({
    latitude: z
      .number({ required_error: 'Latitude is required' })
      .min(-90)
      .max(90),
    longitude: z
      .number({ required_error: 'Longitude is required' })
      .min(-180)
      .max(180),
    address: z.string().max(500).optional(),
    emergencyType: z.enum(['HOSPITAL', 'AMBULANCE', 'POLICE', 'TOWING', 'RESCUE'], {
      required_error: 'Emergency type is required',
    }),
    description: z.string().max(1000).optional(),
    severity: z.string().max(50).optional(),
    googleMapsLink: z.string().max(500).optional(),
    accidentImage: z.string().optional(),
    accidentVideo: z.string().optional(),
    accidentAudio: z.string().optional(),
  }),
});

export const cancelSosSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid SOS request ID'),
  }),
});

export type CreateSosInput = z.infer<typeof createSosSchema>['body'];
