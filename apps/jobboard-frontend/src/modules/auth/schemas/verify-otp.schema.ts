import { z } from 'zod';

export const verifyOtpSchema = z.object({
  otp: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

