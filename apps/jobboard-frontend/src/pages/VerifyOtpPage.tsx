import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyOtpSchema, type VerifyOtpFormData } from '../schemas/verify-otp.schema';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL?.endsWith('/api') 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.VITE_API_URL || '') + '/api';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    setErrorMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/verify`, {
        username: username,
        otpCode: data.otp,
        temporaryToken: temporaryToken,
      });

      if (response.status === 200 && response.data.token) {
        // Login using authStore
        login(response.data);
        
        // Redirect to home
        navigate('/');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrorMessage('Invalid or expired OTP code. Please try again.');
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('OTP verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Verify OTP</CardTitle>
          <CardDescription>
            Enter the verification code sent to your email
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* OTP Code */}
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">
                Verification Code *
              </label>
              <input
                id="otp"
                type="text"
                {...register('otp')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter 6-digit code"
                maxLength={6}
                aria-label="OTP Code"
              />
              {errors.otp && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.otp.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>

            {/* Back to Login */}
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

