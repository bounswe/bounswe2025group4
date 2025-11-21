import { z } from 'zod';

export const createReviewSchema = z.object({
  culture: z
    .number()
    .min(1, 'Culture rating must be at least 1')
    .max(5, 'Culture rating must be at most 5'),
  benefits: z
    .number()
    .min(1, 'Benefits rating must be at least 1')
    .max(5, 'Benefits rating must be at most 5'),
  workLifeBalance: z
    .number()
    .min(1, 'Work-Life Balance rating must be at least 1')
    .max(5, 'Work-Life Balance rating must be at most 5'),
  management: z
    .number()
    .min(1, 'Management rating must be at least 1')
    .max(5, 'Management rating must be at most 5'),
  careerGrowth: z
    .number()
    .min(1, 'Career Growth rating must be at least 1')
    .max(5, 'Career Growth rating must be at most 5'),
  comment: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(2000, 'Review must be at most 2000 characters'),
  isAnonymous: z.boolean(),
});

export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
