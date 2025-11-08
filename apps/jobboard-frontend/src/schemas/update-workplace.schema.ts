import { z } from 'zod';

export const updateWorkplaceSchema = z.object({
  companyName: z.union([
    z.string().min(1, 'Company name is required').max(255),
    z.literal(''),
  ]).optional(),
  sector: z.union([
    z.string().min(1, 'Sector is required').max(100),
    z.literal(''),
  ]).optional(),
  location: z.union([
    z.string().min(1, 'Location is required').max(255),
    z.literal(''),
  ]).optional(),
  shortDescription: z.string().max(300).optional().or(z.literal('')),
  detailedDescription: z.string().max(4000).optional().or(z.literal('')),
  ethicalTags: z.array(z.string()).min(1, 'At least one ethical tag is required'),
  website: z.union([
    z.url('Must be a valid URL'),
    z.literal(''),
  ]).optional(),
});

export type UpdateWorkplaceFormData = z.infer<typeof updateWorkplaceSchema>;

