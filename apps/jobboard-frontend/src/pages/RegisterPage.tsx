import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../schemas/register.schema';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'ROLE_JOBSEEKER',
      gender: '',
      pronouns: '',
      agreeToTerms: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        gender: data.gender || undefined,
        pronouns: data.pronouns || undefined,
      });

      // Check if response contains error even with 200 status
      if (response.data?.message && response.data.message.toLowerCase().includes('error')) {
        // Customize error messages
        const errorMsg = response.data.message;
        if (errorMsg.includes('Email is already in use')) {
          setErrorMessage('Email is already in use. If you haven\'t verified it yet, please check your email for the verification link.');
        } else if (errorMsg.includes('Username is already taken')) {
          setErrorMessage('Username is already taken. Please choose a different username.');
        } else {
          setErrorMessage(errorMsg);
        }
      } else if (response.data?.error) {
        setErrorMessage(response.data.error);
      } else if (response.status === 200 || response.status === 201) {
        setSuccessMessage(
          'Registration successful! Please check your email to verify your account before logging in.'
        );
        // Don't auto-redirect, let user verify email first
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Backend authentication issue
        setErrorMessage('Service temporarily unavailable. Please try again later or contact support.');
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Sign up to access the job board platform
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username *
            </label>
            <input
              id="username"
              type="text"
              {...register('username')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="johndoe"
              aria-label="Username"
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

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password *
              </label>
              <div className="group relative">
                <button
                  type="button"
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground/30 text-xs text-muted-foreground hover:bg-muted"
                  aria-label="Password requirements"
                >
                  i
                </button>
                <div className="invisible absolute left-0 top-6 z-10 w-64 rounded-md border border-border bg-popover p-3 text-xs shadow-md group-hover:visible">
                  <p className="font-medium mb-1">Password must contain:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li className={password?.length >= 8 ? 'text-green-600' : ''}>
                      At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(password || '') ? 'text-green-600' : ''}>
                      One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(password || '') ? 'text-green-600' : ''}>
                      One lowercase letter
                    </li>
                    <li className={/[0-9]/.test(password || '') ? 'text-green-600' : ''}>
                      One number
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(password || '') ? 'text-green-600' : ''}>
                      One special character
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
              aria-label="Password"
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
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="••••••••"
              aria-label="Confirm password"
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

          {/* Role Selection */}
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role *
            </label>
            <select
              id="role"
              {...register('role')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Select your role"
              aria-required="true"
              aria-invalid={!!errors.role}
              aria-describedby={errors.role ? 'role-error' : undefined}
            >
              <option value="ROLE_JOBSEEKER">Job Seeker</option>
              <option value="ROLE_EMPLOYER">Employer</option>
            </select>
            {errors.role && (
              <p id="role-error" className="text-sm text-destructive" role="alert">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Gender and Pronouns (Optional) - Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium">
                Gender (Optional)
              </label>
              <input
                id="gender"
                type="text"
                {...register('gender')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g., Male, Female"
                aria-label="Gender (optional)"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pronouns" className="text-sm font-medium">
                Pronouns (Optional)
              </label>
              <input
                id="pronouns"
                type="text"
                {...register('pronouns')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g., he/him, she/her"
                aria-label="Pronouns (optional)"
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <input
              id="agreeToTerms"
              type="checkbox"
              {...register('agreeToTerms')}
              className="mt-1 h-4 w-4 rounded border-input"
              aria-label="Agree to terms and conditions"
              aria-required="true"
              aria-invalid={!!errors.agreeToTerms}
              aria-describedby={errors.agreeToTerms ? 'terms-error' : undefined}
            />
            <label htmlFor="agreeToTerms" className="text-sm leading-none">
              I agree to the{' '}
              <a href="/terms" className="text-primary underline">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary underline">
                Privacy Policy
              </a>
              *
            </label>
          </div>
          {errors.agreeToTerms && (
            <p id="terms-error" className="text-sm text-destructive" role="alert">
              {errors.agreeToTerms.message}
            </p>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800" role="status">
              {successMessage}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={isLoading}
            aria-label="Create account"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary underline">
              Sign in
            </Link>
          </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

