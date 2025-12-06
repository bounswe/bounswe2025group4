import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas/forgot-password.schema';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';

const API_BASE_URL = import.meta.env.VITE_API_URL?.endsWith('/api')
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.VITE_API_URL || '') + '/api';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation('common');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password-reset`, {
        email: data.email,
      });

      // Check if response contains error even with 200 status
      if (response.data?.message && response.data.message.toLowerCase().includes('error')) {
        toast.error(response.data.message);
      } else if (response.data?.error) {
        toast.error(response.data.error);
      } else {
        toast.success(t('auth.forgot.success'));
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string; error?: string } | undefined;

        if (error.response?.status === 401) {
          // Backend authentication issue - likely endpoint protection problem
          toast.error(t('auth.forgot.errors.serviceUnavailable'));
          return;
        }

        const backendMsg = responseData?.message;
        if (backendMsg) {
          if (backendMsg.includes('Full authentication')) {
            toast.error(t('auth.forgot.errors.serviceUnavailable'));
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

        toast.error(t('auth.forgot.errors.generic'));
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('auth.forgot.errors.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">{t('auth.forgot.title')}</CardTitle>
          <CardDescription>
            {t('auth.forgot.description')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('auth.forgot.email')}
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="john@example.com"
              aria-label={t('auth.forgot.email')}
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

          {/* Submit Button */}
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={isLoading}
            aria-label={t('auth.forgot.submit')}
          >
            {isLoading ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
          </Button>

          {/* Back to Login Link */}
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.forgot.loginPrompt')}{' '}
            <Link to="/login" className="text-primary underline">
              {t('auth.forgot.loginLink')}
            </Link>
          </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
