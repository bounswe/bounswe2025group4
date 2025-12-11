import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useTranslation } from 'react-i18next';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerSchema, type RegisterFormData } from '../schemas/register.schema';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';

const API_BASE_URL = import.meta.env.VITE_API_URL?.endsWith('/api')
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.VITE_API_URL || '') + '/api';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { t } = useTranslation('common');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'ROLE_JOBSEEKER',
      firstName: '',
      lastName: '',
      pronounSet: undefined,
      bio: '',
      gender: '',
      pronouns: '',
      agreeToTerms: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // Prepare request body - only include optional fields if they have values
      const requestBody: Record<string, unknown> = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      // Only add optional fields if they have values
      if (data.pronounSet && typeof data.pronounSet === 'string' && data.pronounSet.trim() !== '') {
        requestBody.pronounSet = data.pronounSet;
      }
      if (data.bio && typeof data.bio === 'string' && data.bio.trim() !== '') {
        requestBody.bio = data.bio;
      }

      const response = await axios.post(`${API_BASE_URL}/auth/register`, requestBody);

      if (response.data?.message && response.data.message.toLowerCase().includes('error')) {
        const errorMsg = response.data.message;
        if (errorMsg.includes('Email is already in use')) {
          toast.error(t('auth.register.errors.emailInUse'));
        } else if (errorMsg.includes('Username is already taken')) {
          toast.error(t('auth.register.errors.usernameInUse'));
        } else {
          toast.error(errorMsg);
        }
      } else if (response.data?.error) {
        toast.error(response.data.error);
      } else if (response.status === 200 || response.status === 201) {
        toast.success(t('auth.register.success'));
        setRegistrationComplete(true);
        // Don't auto-redirect, let user verify email first
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string; error?: string } | undefined;

        if (error.response?.status === 401) {
          toast.error(t('auth.register.errors.serviceUnavailable'));
          return;
        }

        if (responseData?.message) {
          toast.error(responseData.message);
          return;
        }

        if (responseData?.error) {
          toast.error(responseData.error);
          return;
        }

        if (error.message) {
          toast.error(error.message);
          return;
        }

        toast.error(t('auth.register.errors.generic'));
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('auth.register.errors.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">
            {registrationComplete ? t('auth.register.checkEmail') : t('auth.register.createAccount')}
          </CardTitle>
          <CardDescription>
            {registrationComplete
              ? t('auth.register.verificationLink')
              : t('auth.register.description')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {registrationComplete ? (
            <div className="space-y-4 text-center py-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setRegistrationComplete(false)}
                  className="text-primary hover:underline font-medium"
                  type="button"
                >
                  try again
                </button>
              </p>
            </div>
          ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Username and Email - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  {t('auth.register.username')}
                </label>
                <input
                  id="username"
                  type="text"
                  {...register('username')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="johndoe"
                  aria-label={t('auth.register.username')}
                  aria-required="true"
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                />
                {errors.username && (
                  <p id="username-error" className="text-sm text-destructive" role="alert">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t('auth.register.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="john@example.com"
                  aria-label={t('auth.register.email')}
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* First Name and Last Name - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="John"
                  aria-label="First Name"
                  aria-required="true"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                />
                {errors.firstName && (
                  <p id="firstName-error" className="text-sm text-destructive" role="alert">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Doe"
                  aria-label="Last Name"
                  aria-required="true"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                />
                {errors.lastName && (
                  <p id="lastName-error" className="text-sm text-destructive" role="alert">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password and Confirm Password - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    {t('auth.register.password')}
                  </label>
                  <div className="group relative">
                    <button
                      type="button"
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground/30 text-xs text-muted-foreground hover:bg-muted"
                      aria-label={t('auth.register.passwordInfo')}
                    >
                      i
                    </button>
                    <div className="invisible absolute left-0 top-6 z-10 w-64 rounded-md border border-border bg-popover p-3 text-xs shadow-md group-hover:visible">
                      <p className="font-medium mb-1">{t('auth.register.passwordInfo')}</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li className={password?.length >= 8 ? 'text-green-600' : ''}>
                          {t('auth.register.passwordRules.length')}
                        </li>
                        <li className={/[A-Z]/.test(password || '') ? 'text-green-600' : ''}>
                          {t('auth.register.passwordRules.uppercase')}
                        </li>
                        <li className={/[a-z]/.test(password || '') ? 'text-green-600' : ''}>
                          {t('auth.register.passwordRules.lowercase')}
                        </li>
                        <li className={/[0-9]/.test(password || '') ? 'text-green-600' : ''}>
                          {t('auth.register.passwordRules.number')}
                        </li>
                        <li className={/[^A-Za-z0-9]/.test(password || '') ? 'text-green-600' : ''}>
                          {t('auth.register.passwordRules.special')}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="••••••••"
                  aria-label={t('auth.register.password')}
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  {t('auth.register.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="••••••••"
                  aria-label={t('auth.register.confirmPassword')}
                  aria-required="true"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                />
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Role and Pronoun Set - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  {t('auth.register.role')}
                </label>
                <select
                  id="role"
                  {...register('role')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={t('auth.register.role')}
                  aria-required="true"
                  aria-invalid={!!errors.role}
                  aria-describedby={errors.role ? 'role-error' : undefined}
                >
                  <option value="ROLE_JOBSEEKER">{t('auth.register.roles.jobSeeker')}</option>
                  <option value="ROLE_EMPLOYER">{t('auth.register.roles.employer')}</option>
                </select>
                {errors.role && (
                  <p id="role-error" className="text-sm text-destructive" role="alert">
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="pronounSet" className="text-sm font-medium">
                  Pronouns (Optional)
                </label>
                <select
                  id="pronounSet"
                  {...register('pronounSet')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Pronouns"
                >
                  <option value="">Select pronouns (optional)</option>
                  <option value="HE_HIM">He/Him</option>
                  <option value="SHE_HER">She/Her</option>
                  <option value="THEY_THEM">They/Them</option>
                  <option value="SHE_THEY">She/They</option>
                  <option value="HE_THEY">He/They</option>
                  <option value="OTHER">Other</option>
                  <option value="NONE">Prefer not to say</option>
                </select>
                {errors.pronounSet && (
                  <p id="pronounSet-error" className="text-sm text-destructive" role="alert">
                    {errors.pronounSet.message}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                {...register('bio')}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us about yourself..."
                aria-label="Bio"
                maxLength={250}
                rows={2}
              />
              {errors.bio && (
                <p id="bio-error" className="text-sm text-destructive" role="alert">
                  {errors.bio.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <input
                id="agreeToTerms"
                type="checkbox"
                {...register('agreeToTerms')}
                className="mt-1 h-4 w-4 rounded border-input"
                aria-label={t('auth.register.termsLabelPlain')}
                aria-required="true"
                aria-invalid={!!errors.agreeToTerms}
                aria-describedby={errors.agreeToTerms ? 'terms-error' : undefined}
              />
              <label htmlFor="agreeToTerms" className="text-sm leading-none">
                <Trans
                  i18nKey="auth.register.termsLabel"
                  components={{
                    TermsLink: <a href="/terms" className="text-primary underline" />,
                    PrivacyLink: <a href="/privacy" className="text-primary underline" />,
                  }}
                />
              </label>
            </div>
            {errors.agreeToTerms && (
              <p id="terms-error" className="text-sm text-destructive" role="alert">
                {errors.agreeToTerms.message}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading}
              aria-label={t('auth.register.submit')}
            >
              {isLoading ? t('auth.register.submitting') : t('auth.register.submit')}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.register.loginPrompt')}{' '}
              <Link to="/login" className="text-primary underline">
                {t('auth.register.loginLink')}
              </Link>
            </p>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
