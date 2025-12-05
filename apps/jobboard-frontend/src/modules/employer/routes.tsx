import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const EmployerDashboardPage = lazy(() => import('./pages/EmployerDashboardPage'));
const EmployerJobPostDetailsPage = lazy(() => import('./pages/EmployerJobPostDetailsPage'));
const EmployerEditJobPostPage = lazy(() => import('./pages/EmployerEditJobPostPage'));
import ProtectedRoute from '@shared/components/common/ProtectedRoute';

export const employerRoutes: RouteObject[] = [
  {
    path: 'employer/dashboard',
    element: (
      <ProtectedRoute>
        <EmployerDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/jobs/:jobId',
    element: (
      <ProtectedRoute>
        <EmployerJobPostDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/jobs/:jobId/edit',
    element: (
      <ProtectedRoute>
        <EmployerEditJobPostPage />
      </ProtectedRoute>
    ),
  },
];

