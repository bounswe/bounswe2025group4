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
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
