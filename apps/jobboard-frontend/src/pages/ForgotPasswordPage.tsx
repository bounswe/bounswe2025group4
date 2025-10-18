import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas/forgot-password.schema';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL?.endsWith('/api') 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.VITE_API_URL || '') + '/api';

console.log('ForgotPasswordPage - VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('ForgotPasswordPage - API_BASE_URL:', API_BASE_URL);

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password-reset`, {
        email: data.email,
      });

      // Check if response contains error even with 200 status
      if (response.data?.message && response.data.message.toLowerCase().includes('error')) {
        setErrorMessage(response.data.message);
      } else if (response.data?.error) {
        setErrorMessage(response.data.error);
      } else {
        setSuccessMessage(
          'Password reset link has been sent to your email. Please check your inbox.'
        );
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Backend authentication issue - likely endpoint protection problem
        setErrorMessage('Service temporarily unavailable. Please try again later or contact support.');
      } else if (error.response?.data?.message) {
        const backendMsg = error.response.data.message;
        if (backendMsg.includes('Full authentication')) {
          setErrorMessage('Service temporarily unavailable. Please try again later or contact support.');
        } else {
          setErrorMessage(backendMsg);
        }
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to send reset link. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email *
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="john@example.com"
              aria-label="Email address"
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
            aria-label="Send reset link"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          {/* Back to Login Link */}
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="text-primary underline">
              Back to login
            </Link>
          </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

