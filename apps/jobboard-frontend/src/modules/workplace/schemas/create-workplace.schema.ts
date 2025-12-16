import { z } from 'zod';

export const createWorkplaceSchema = z.object({
  companyName: z.string().min(1, 'workplace.createModal.errors.companyNameRequired').max(255),
  sector: z.string().min(1, 'workplace.createModal.errors.sectorRequired').max(100),
  location: z.string().min(1, 'workplace.createModal.errors.locationRequired').max(255),
  shortDescription: z.string().max(300).optional(),
  detailedDescription: z.string().max(4000).optional(),
  ethicalTags: z.array(z.string()).min(1, 'workplace.createModal.errors.ethicalTagsRequired'),
  website: z.url('workplace.createModal.errors.websiteInvalid').optional().or(z.literal('')),
});

export type CreateWorkplaceFormData = z.infer<typeof createWorkplaceSchema>;

