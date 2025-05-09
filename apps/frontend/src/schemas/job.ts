import { z } from 'zod';

// Define ethical policy options
export const ethicalPolicies = [
  'fair-wage',
  'equal-opportunity',
  'remote-friendly',
  'sustainable-practices',
  'inclusive-culture',
  'diversity-focused',
  'work-life-balance',
  'career-growth',
  'transparent-compensation',
  'eco-friendly'
] as const;

export const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship'
] as const;

// Define zod schema for job validation
export const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(2, 'Location is required'),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  employmentType: z.enum(employmentTypes),
  ethicalPolicies: z.array(z.enum(ethicalPolicies)).min(1, 'At least one ethical policy must be selected'),
  companyId: z.string().min(1, 'Company is required'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().optional(),
});

// Define schema for application status updates
export const applicationStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected']),
  feedback: z.string().optional(),
});

// Schema for job with optional fields for updates
export const jobUpdateSchema = jobSchema.partial();

// Type extraction
export type JobFormValues = z.infer<typeof jobSchema>;
export type JobUpdateValues = z.infer<typeof jobUpdateSchema>;
export type ApplicationStatusUpdate = z.infer<typeof applicationStatusSchema>; 