import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas/reset-password.schema';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';

const API_BASE_URL = import.meta.env.VITE_API_URL?.endsWith('/api')
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.VITE_API_URL || '') + '/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation('common');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error(t('auth.reset.errors.missingToken'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password-reset/confirm`, {
        token,
        newPassword: data.password,
      });

      // Check if response contains error even with 200 status
      if (response.data?.message && response.data.message.toLowerCase().includes('error')) {
        const backendMsg = response.data.message;
        if (backendMsg.includes('same as the old password')) {
          toast.error(t('auth.reset.errors.sameAsOld'));
        } else {
          toast.error(backendMsg);
        }
      } else if (response.data?.error) {
        toast.error(response.data.error);
      } else {
        // Success: redirect to login with success message
        navigate('/login', {
          replace: true,
          state: { message: t('auth.reset.success') },
        });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string; error?: string } | undefined;
        const backendMsg = responseData?.message;

        if (backendMsg) {
          if (backendMsg.includes('same as the old password')) {
            toast.error(t('auth.reset.errors.sameAsOld'));
          } else {
            toast.error(backendMsg);
          }
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

        toast.error(t('auth.reset.errors.generic'));
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('auth.reset.errors.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">{t('auth.reset.invalidTitle')}</CardTitle>
            <CardDescription>
              {t('auth.reset.invalidDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="default" onClick={() => navigate('/forgot-password')}>
              {t('auth.reset.requestNew')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">{t('auth.reset.title')}</CardTitle>
          <CardDescription>
            {t('auth.reset.description')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('auth.reset.newPassword')}
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
              aria-label={t('auth.reset.newPassword')}
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t('auth.reset.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="••••••••"
              aria-label={t('auth.reset.confirmPassword')}
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

          {/* Submit Button */}
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={isLoading}
            aria-label={t('auth.reset.submit')}
          >
            {isLoading ? t('auth.reset.submitting') : t('auth.reset.submit')}
          </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

