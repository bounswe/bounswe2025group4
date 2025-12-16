import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@shared/components/common/ProtectedRoute';

const WorkplacesAccessGuard = lazy(() => import('@/layouts/WorkplacesAccessGuard'));
const WorkplacesPage = lazy(() => import('./pages/WorkplacesPage'));
const EmployerWorkplacesPage = lazy(() => import('./pages/EmployerWorkplacesPage'));
const WorkplaceProfilePage = lazy(() => import('./pages/WorkplaceProfilePage'));
const WorkplaceSettingsPage = lazy(() => import('./pages/WorkplaceSettingsPage'));
const ManageEmployerRequestsPage = lazy(() => import('./pages/ManageEmployerRequestsPage'));

export const workplaceRoutes: RouteObject[] = [
  {
    path: 'workplaces',
    element: <WorkplacesAccessGuard />,
    children: [
      { index: true, element: <Navigate to="browse" replace /> },
      { path: 'browse', element: <WorkplacesPage /> },
      {
        path: 'my',
        element: (
          <ProtectedRoute requiredRole="ROLE_EMPLOYER">
            <EmployerWorkplacesPage />
          </ProtectedRoute>
        ),
      },
      { path: 'details/:workplaceId', element: <WorkplaceProfilePage /> },
      { path: 'reviews/:workplaceId', element: <WorkplaceProfilePage /> },
      {
        path: 'details/:workplaceId/requests',
        element: (
          <ProtectedRoute requiredRole="ROLE_EMPLOYER">
            <ManageEmployerRequestsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'details/:workplaceId/settings',
        element: (
          <ProtectedRoute requiredRole="ROLE_EMPLOYER">
            <WorkplaceSettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: 'workplace/:id',
    element: <WorkplaceProfilePage />,
  },
  { path: 'employer/workplaces', element: <Navigate to="/workplaces/my" replace /> },
  {
    path: 'employer/workplace/:workplaceId/requests',
    element: (
      <ProtectedRoute requiredRole="ROLE_EMPLOYER">
        <ManageEmployerRequestsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/workplace/:workplaceId/settings',
    element: (
      <ProtectedRoute requiredRole="ROLE_EMPLOYER">
        <WorkplaceSettingsPage />
      </ProtectedRoute>
    ),
  },
];

