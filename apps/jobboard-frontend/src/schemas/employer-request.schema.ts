import { z } from 'zod';

export const employerRequestSchema = z.object({
  note: z.string().max(500, 'Note must not exceed 500 characters').optional(),
});

export type EmployerRequestFormData = z.infer<typeof employerRequestSchema>;
