import { z } from 'zod';

// Password strength requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be at most 50 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(30, 'First name must be at most 30 characters'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(30, 'Last name must be at most 30 characters'),
    role: z.enum(['ROLE_JOBSEEKER', 'ROLE_EMPLOYER'], {
      message: 'Please select a role',
    }),
    pronounSet: z
      .union([
        z.enum(['HE_HIM', 'SHE_HER', 'THEY_THEM', 'SHE_THEY', 'HE_THEY', 'OTHER', 'NONE']),
        z.literal(''),
      ])
      .optional(),
    bio: z.string().max(250, 'Bio must be at most 250 characters').optional(),
    gender: z.string().optional(),
    pronouns: z.string().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

