import { z } from 'zod';
import { JobPost } from '../types/job';

// Define ethical policy options
export const ethicalPolicies = [
  'fair_wage',
  'diversity',
  'sustainability',
  'wellbeing',
  'transparency',
] as const;

// Define zod schema for job validation
export const jobSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(2, 'Location is required'),
  minSalary: z.number().int().positive().optional(),
  maxSalary: z.number().int().positive().optional(),
  isRemote: z.boolean(),
  ethicalTags: z
    .array(z.enum(ethicalPolicies))
    .min(1, 'At least one ethical policy must be selected'),
  company: z.string().min(1, 'Company is required'),
  contact: z.string().email('Invalid email address'),
});

// Define schema for application status updates
export const applicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED'] as const),
  feedback: z.string().optional(),
});

// Schema for job with optional fields for updates
export const jobUpdateSchema = jobSchema.partial();

// Type extraction
export type JobFormValues = z.infer<typeof jobSchema>;
export type JobUpdateValues = z.infer<typeof jobUpdateSchema>;
export type ApplicationStatusUpdate = z.infer<typeof applicationStatusSchema>;

export const jobFormValueFromJobPost = (jobPost: JobPost): JobFormValues => {
  const newEthicalTags = jobPost.ethicalTags
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) =>
      ethicalPolicies.includes(tag as (typeof ethicalPolicies)[number])
    );
  const jobFormValues: JobFormValues = {
    ...jobPost,
    isRemote: jobPost.remote,
    ethicalTags: newEthicalTags as (
      | 'fair_wage'
      | 'diversity'
      | 'sustainability'
      | 'wellbeing'
      | 'transparency'
    )[],
  };
  return jobFormValues;
};
