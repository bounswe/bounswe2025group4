import { z } from 'zod';

export const createWorkplaceSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(255),
  sector: z.string().min(1, 'Sector is required').max(100),
  location: z.string().min(1, 'Location is required').max(255),
  shortDescription: z.string().max(300).optional(),
  detailedDescription: z.string().max(4000).optional(),
  ethicalTags: z.array(z.string()).min(1, 'At least one ethical tag is required'),
  website: z.url('Must be a valid URL').optional().or(z.literal('')),
});

export type CreateWorkplaceFormData = z.infer<typeof createWorkplaceSchema>;
