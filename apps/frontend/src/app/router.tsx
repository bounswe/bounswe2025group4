/*
Data loading with React Router's loader functions
Code splitting with lazy loading
Error boundary for handling route errors
A root layout with common elements
Basic routing structure for home, jobs, login, and register pages

Also, note that this is a basic setup. We'll want to:
Add proper TypeScript types for our route data
Implement actual API calls in the loaders
Add proper authentication checks
Add navigation components
Style our layouts
*/

import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy load pages for better performance
const HomePage = lazy(() => import('../pages/Home'));
const JobsPage = lazy(() => import('../pages/Jobs'));
const LoginPage = lazy(() => import('../pages/Login'));
const RegisterPage = lazy(() => import('../pages/Register'));

// Root layout with navigation and common elements
const RootLayout = lazy(() => import('../layouts/Root'));

// Error boundary component
const ErrorBoundary = lazy(() => import('../components/ErrorBoundary'));

// Define routes with data loading and error handling
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
          // Load any data needed for the homepage
          return { message: 'Welcome to the Job Platform' };
        },
      },
      {
        path: 'jobs',
        element: <JobsPage />,
        loader: async () => {
          // This will be replaced with actual API call
          return { jobs: [] };
        },
      },
      {
        path: 'login',
        element: <LoginPage />,
        // Redirect if user is already logged in
        loader: async () => {
          const isLoggedIn = false; // This will be replaced with actual auth check
          if (isLoggedIn) {
            return redirect('/');
          }
          return null;
        },
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
]);

export function Router() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
