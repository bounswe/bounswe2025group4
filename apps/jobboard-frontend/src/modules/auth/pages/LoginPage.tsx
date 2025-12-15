import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { useAuthActions } from '@shared/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL?.endsWith('/api')
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthActions();
  const { t } = useTranslation('common');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  // Check for verification messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
    if (location.state?.error) {
      toast.error(location.state.error);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: data.username,
        password: data.password,
      });

      if (response.status === 200) {
        // Check if 2FA is required
        if (response.data.temporaryToken) {
          // 2FA required - redirect to OTP verification
          toast.success(t('auth.login.notifications.2faRequired'));
          navigate('/verify-otp', {
            state: {
              temporaryToken: response.data.temporaryToken,
              username: data.username,
            },
          });
        } else if (response.data.token) {
          // No 2FA - direct login
          login(response.data);
          toast.success(t('auth.login.notifications.loginSuccess'));
          // Redirect to home
          navigate('/');
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string; error?: string; code?: string } | undefined;

        // Check for banned account - prioritize this check
        if (responseData?.code === 'ACCOUNT_BANNED' || responseData?.message?.toLowerCase().includes('banned')) {
          const banReason = responseData?.message || 'Your account has been banned.';
          const banMessage = banReason.includes('banned') 
            ? banReason 
            : `Your account has been banned. ${banReason ? `Reason: ${banReason}` : 'Please contact support for more information.'}`;
          toast.error(banMessage, {
            autoClose: 10000,
          });
          return;
        }

        if (error.response?.status === 401) {
          // Could be wrong credentials or backend config issue
          if (responseData?.message?.includes('Full authentication')) {
            toast.error(t('auth.login.errors.serviceUnavailable'));
          } else {
            toast.error(t('auth.login.errors.invalidCredentials'));
          }
          return;
        }

        // Make error messages more descriptive
        if (responseData?.message) {
          let descriptiveMessage = responseData.message;
          const lowerMessage = responseData.message.toLowerCase();
          
          // Replace generic error codes with descriptive messages
          if (lowerMessage.includes('spam')) {
            descriptiveMessage = 'This action was flagged as spam. Please try again later or contact support if you believe this is an error.';
          } else if (lowerMessage.includes('invalid') || lowerMessage.includes('credentials')) {
            descriptiveMessage = 'Invalid username or password. Please check your credentials and try again.';
          } else if (lowerMessage.includes('not found') || lowerMessage.includes('user not found')) {
            descriptiveMessage = 'User not found. Please check your username and try again.';
          } else if (lowerMessage.includes('email') && (lowerMessage.includes('verified') || lowerMessage.includes('verification'))) {
            descriptiveMessage = 'Please verify your email address before logging in. Check your inbox for the verification link.';
          } else if (lowerMessage === 'spam' || lowerMessage.trim() === 'spam') {
            descriptiveMessage = 'This action was flagged as spam. Please try again later or contact support if you believe this is an error.';
          }
          
          toast.error(descriptiveMessage);
          return;
        }

        if (responseData?.error) {
          // Also check error field for spam
          if (responseData.error.toLowerCase().includes('spam') || responseData.error.toLowerCase() === 'spam') {
            toast.error('This action was flagged as spam. Please try again later or contact support if you believe this is an error.');
          } else {
            toast.error(responseData.error);
          }
          return;
        }

        if (error.message) {
          toast.error(error.message);
          return;
        }

        toast.error(t('auth.login.errors.generic'));
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('auth.login.errors.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">{t('auth.login.title')}</CardTitle>
          <CardDescription>
            {t('auth.login.description')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              {t('auth.login.username')}
            </label>
            <input
              id="username"
              type="text"
              {...register('username')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="johndoe"
              aria-label={t('auth.login.username')}
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

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                {t('auth.login.password')}
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="••••••••"
              aria-label={t('auth.login.password')}
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

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-input"
              aria-label={t('auth.login.rememberMe')}
            />
            <label htmlFor="rememberMe" className="text-sm leading-none cursor-pointer">
              {t('auth.login.rememberMe')}
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={isLoading}
            aria-label={t('auth.login.submit')}
          >
            {isLoading ? t('auth.login.submitting') : t('auth.login.submit')}
          </Button>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.login.registerPrompt')}{' '}
            <Link to="/register" className="text-primary underline">
              {t('auth.login.registerLink')}
            </Link>
          </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
