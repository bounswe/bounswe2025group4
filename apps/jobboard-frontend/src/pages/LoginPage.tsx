import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthActions } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL?.endsWith('/api') 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.VITE_API_URL || '') + '/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
      setSuccessMessage(location.state.message);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
    if (location.state?.error) {
      setErrorMessage(location.state.error);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: data.username,
        password: data.password,
      });

      if (response.status === 200) {
        // Check if 2FA is required
        if (response.data.temporaryToken) {
          // 2FA required - redirect to OTP verification
          navigate('/verify-otp', {
            state: {
              temporaryToken: response.data.temporaryToken,
              username: data.username,
            },
          });
        } else if (response.data.token) {
          // No 2FA - direct login
          login(response.data);
          
          // Redirect to home
          navigate('/');
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string; error?: string } | undefined;

        if (error.response?.status === 401) {
          // Could be wrong credentials or backend config issue
          if (responseData?.message?.includes('Full authentication')) {
            setErrorMessage(t('auth.login.errors.serviceUnavailable'));
          } else {
            setErrorMessage(t('auth.login.errors.invalidCredentials'));
          }
          return;
        }

        if (responseData?.message) {
          setErrorMessage(responseData.message);
          return;
        }

        if (responseData?.error) {
          setErrorMessage(responseData.error);
          return;
        }

        if (error.message) {
          setErrorMessage(error.message);
          return;
        }

        setErrorMessage(t('auth.login.errors.generic'));
        return;
      }

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(t('auth.login.errors.generic'));
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

          {/* Success Message */}
          {successMessage && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800" role="status">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {errorMessage}
            </div>
          )}

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

