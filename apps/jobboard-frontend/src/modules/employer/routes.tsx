import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const EmployerDashboardPage = lazy(() => import('./pages/EmployerDashboardPage'));
const JobDetailPage = lazy(() => import('@modules/jobs/pages/JobDetailPage'));
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
        <JobDetailPage />
      </ProtectedRoute>
    ),
  },
];

