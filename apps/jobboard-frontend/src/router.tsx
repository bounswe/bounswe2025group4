import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import RootLayout from './layouts/RootLayout';
import ErrorBoundary from './components/ErrorBoundary';
import CenteredLoader from './components/CenteredLoader';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: async () => {
          return { message: 'Welcome to the Job Platform' };
        },
      },
      {
        path: 'jobs',
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Jobs Page</h1>
          </div>
        ),
      },
      {
        path: 'mentorship',
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Mentorship Page</h1>
          </div>
        ),
      },
      {
        path: 'forum',
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Forum Page</h1>
          </div>
        ),
      },
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
    ],
  },
]);

export function Router() {
  return (
    <Suspense fallback={<CenteredLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
