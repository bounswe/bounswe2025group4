import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const EmailVerificationPage = lazy(() => import('./pages/EmailVerificationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyOtpPage = lazy(() => import('./pages/VerifyOtpPage'));

export const authRoutes: RouteObject[] = [
  {
    path: 'register',
    element: <RegisterPage />,
  },
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    path: 'verify-email',
    element: <EmailVerificationPage />,
  },
  {
    path: 'forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: 'reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: 'verify-otp',
    element: <VerifyOtpPage />,
  },
  {
    path: 'api/auth/reset-password',
    element: <ResetPasswordPage />,
  },
];

