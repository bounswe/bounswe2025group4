import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from '@shared/components/common/ProtectedRoute';

const JobsPage = lazy(() => import('./pages/JobsPage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const MyApplicationsPage = lazy(() => import('./applications/pages/MyApplicationsPage'));
const WorkplacesPage = lazy(() => import('@modules/workplace/pages/WorkplacesPage'));
const EmployerDashboardPage = lazy(() => import('@modules/employer/pages/EmployerDashboardPage'));

export const jobsRoutes: RouteObject[] = [
  {
    path: 'jobs',
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="browse" replace /> },
      { path: 'browse', element: <JobsPage /> },
      {
        path: 'applications',
        element: (
          <ProtectedRoute requiredRole="ROLE_JOBSEEKER">
            <MyApplicationsPage />
          </ProtectedRoute>
        ),
      },
      { path: 'workplaces', element: <WorkplacesPage /> },
      {
        path: 'employer',
        element: (
          <ProtectedRoute requiredRole="ROLE_EMPLOYER">
            <EmployerDashboardPage />
          </ProtectedRoute>
        ),
      },
      { path: ':id', element: <JobDetailPage /> },
    ],
  },
];

