import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { verifyOtpSchema, type VerifyOtpFormData } from '../schemas/verify-otp.schema';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { useAuthActions } from '@shared/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL?.endsWith('/api')
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.VITE_API_URL || '') + '/api';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthActions();
  const { t } = useTranslation();

  const temporaryToken = location.state?.temporaryToken;
  const username = location.state?.username;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
  });

  // Redirect if no temporary token
  if (!temporaryToken) {
    navigate('/login');
    return null;
  }

  const onSubmit = async (data: VerifyOtpFormData) => {
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/verify`, {
        username: username,
        otpCode: data.otp,
        temporaryToken: temporaryToken,
      });

      if (response.status === 200 && response.data.token) {
        // Store token in auth store
        login(response.data);
        toast.success(t('auth.otp.success'));
        // Redirect to home
        navigate('/');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string; error?: string } | undefined;

        if (error.response?.status === 401) {
          toast.error(t('auth.otp.errors.invalid'));
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

        toast.error(t('auth.otp.errors.generic'));
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('auth.otp.errors.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">{t('auth.otp.title')}</CardTitle>
          <CardDescription>
            {t('auth.otp.description')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* OTP Code */}
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">
                {t('auth.otp.code')}
              </label>
              <input
                id="otp"
                type="text"
                {...register('otp')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('auth.otp.placeholder')}
                maxLength={6}
                aria-label={t('auth.otp.code')}
              />
              {errors.otp && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.otp.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? t('auth.otp.submitting') : t('auth.otp.submit')}
            </Button>

            {/* Back to Login */}
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:underline"
              >
                {t('auth.otp.backToLogin')}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

