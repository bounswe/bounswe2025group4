import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import CenteredLoader from '../components/layout/CenterLoader';
import ForgotPasswordPage from '../pages/Auth/ForgotPassword';
import ResetPasswordPage from '../pages/Auth/ResetPassword';
import RedirectIfAuth from '../components/auth/RedirectIfAuth';
import RegisterSuccesfull from '../pages/Auth/RegisterSuccesful';
import UserProfileRedirect from '../pages/Profile/UserProfileRedirect';
import UserProfile from '../pages/Profile/UserProfile';

// Lazy load pages for better performance

const HomePage = lazy(() => import('../pages/Home'));
const LoginPage = lazy(() => import('../pages/Auth/Login'));
const RegisterPage = lazy(() => import('../pages/Auth/Register'));

// Job => job seeker
const JobListPage = lazy(() => import('../pages/Jobs/JobList'));
const JobDetailPage = lazy(() => import('../pages/Jobs/JobDetail'));

// Job => employer
const JobDashboardPage = lazy(
  () => import('../pages/JobDashboard/JobDashboard')
);
const CreateJobPage = lazy(() => import('../pages/JobDashboard/CreateJobPage'));
const JobDetailDashboard = lazy(
  () => import('../pages/JobDashboard/JobDetailDashboard')
);

// Forum part
const ThreadListPage = lazy(() => import('../pages/Forum/ThreadList'));
const ThreadDetailPage = lazy(() => import('../pages/Forum/ThreadDetail'));

// Util
const RoleBasedRedirect = lazy(
  () => import('../components/auth/RoleBasedRedirect')
);

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
          return { message: 'Welcome to the Job Platform' };
        },
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
        path: 'register-successful',
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
        path: '/profile',
        element: <UserProfileRedirect />,
      },
      {
        path: '/u/:userId',
        element: <UserProfile />,
      },
      {
        // This is the new entry point for when a user clicks "Jobs"
        path: 'jobs',
        element: <RoleBasedRedirect />,
      },
      {
        // Renamed/Re-scoped route for job seekers to view the list of jobs
        path: 'jobs/list',
        element: <JobListPage />,
      },
      {
        // New job detail route
        path: 'jobs/:id',
        element: <JobDetailPage />,
      },
      // Add employer dashboard route
      {
        path: 'dashboard/jobs',
        element: <JobDashboardPage />,
        // In a real app, this would have an auth check loader
        // to redirect non-employers or unauthenticated users
      },
      {
        path: 'dashboard/jobs/create',
        element: <CreateJobPage />,
        // Add auth protection: only employers can access
      },
      {
        path: 'dashboard/jobs/:id',
        element: <JobDetailDashboard />,
        // Add auth protection: only employer who owns the job can access
      },
      {
        path: 'forum',
        element: <ThreadListPage />,
      },
      {
        path: 'forum/:id',
        element: <ThreadDetailPage />,
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
