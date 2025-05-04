import {
  createBrowserRouter,
  RouterProvider,
  // redirect,
} from 'react-router-dom';
import { Suspense, lazy } from 'react';
import CenteredLoader from '../components/layout/CenterLoader';
import ForgotPasswordPage from '../pages/Auth/ForgotPassword';
import ResetPasswordPage from '../pages/Auth/ResetPassword';
import { RedirectIfAuth } from '../utils/RedirectIfAuth';
import RegisterSuccesfull from '../pages/Auth/RegisterSuccesfull';

// Lazy load pages for better performance
const HomePage = lazy(() => import('../pages/Home'));
// Removed placeholder JobsPage import
const LoginPage = lazy(() => import('../pages/Auth/Login'));
const RegisterPage = lazy(() => import('../pages/Auth/Register'));

// Import new pages and their loader/action functions
const JobListPage = lazy(() => import('../pages/JobList'));
const JobDetailPage = lazy(() => import('../pages/JobDetail'));
import { jobDetailLoader, applyAction } from '../pages/JobDetail';
// Assuming JobList doesn't need a specific loader anymore as data is fetched client-side with TanStack Query

// Root layout with navigation and common elements
const RootLayout = lazy(() => import('../layouts/Root'));

// Error boundary component
const ErrorBoundary = lazy(() => import('../components/ErrorBoundary'));

/**
 * Router configuration with nested routes and data loading.
 *
 * @type {import('react-router-dom').RouteObject[]}
 *
 * @remarks
 * Route Structure:
 * - / (Home): Landing page with welcome message
 *   - Loader provides initial welcome message
 *
 * - /jobs (Jobs listing): Job search and listing page
 *   - Loader fetches available jobs
 *
 * - /login (Login): Authentication page
 *   - Loader checks authentication status
 *   - Redirects to home if already authenticated
 *
 * - /register (Registration): New user registration
 *
 * Each route is lazy-loaded for optimal performance and
 * includes its own data loading strategy through loader functions.
 */
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
        // Updated jobs route - no loader needed here as page uses useQuery
        path: 'jobs',
        element: <JobListPage />,
        // loader: jobListLoader, // Removed - TanStack handles loading client-side based on URL params
      },
      {
        // New job detail route
        path: 'jobs/:id',
        element: <JobDetailPage />,
        loader: jobDetailLoader, // Loader to fetch job details
        action: applyAction, // Action to handle application submission
      },
      {
        path: 'login',
        element: (
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        ),
      },
      {
        path: 'register',
        element: (
          <RedirectIfAuth>
            <RegisterPage />
          </RedirectIfAuth>
        ),
      },
      {
        path: 'register-successfull',
        element: <RegisterSuccesfull />,
      },
      {
        path: 'forgot-password',
        element: (
          <RedirectIfAuth>
            <ForgotPasswordPage />
          </RedirectIfAuth>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <RedirectIfAuth>
            <ResetPasswordPage />
          </RedirectIfAuth>
        ),
      },
      {
        path: 'profile', // New Profile Route
        element: <div>User Profile Page (Placeholder)</div>, // Placeholder element
        // Optional: Add a loader if profile page needs data
        // loader: async () => {
        //   // Check auth status, redirect if not logged in
        //   const authTokens = localStorage.getItem('auth_tokens');
        //   if (!authTokens) {
        //     return redirect('/login');
        //   }
        //   // Fetch user profile data
        //   return { user: { name: "User Name" } };
        // },
      },
    ],
  },
]);

/**
 * Main Router component that provides routing functionality to the application.
 *
 * @component
 * @returns {JSX.Element} Router component wrapped with Suspense for lazy loading
 *
 * @remarks
 * - Implements code splitting through React.lazy
 * - Provides loading fallback during route transitions
 * - Handles all routing logic and navigation
 * - Manages route-level error boundaries
 * - Supports data loading through route loaders
 *
 * The Router component is the top-level routing component that should be
 * rendered within your app's provider hierarchy (typically inside AuthProvider).
 */
export function Router() {
  return (
    <Suspense fallback={<CenteredLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
