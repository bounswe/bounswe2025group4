import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const ManageEmployerRequestsPage = lazy(() => import('./pages/ManageEmployerRequestsPage'));
const WorkplaceProfilePage = lazy(() => import('./pages/WorkplaceProfilePage'));
const WorkplaceSettingsPage = lazy(() => import('./pages/WorkplaceSettingsPage'));
const WorkplacesPage = lazy(() => import('./pages/WorkplacesPage'));
import ProtectedRoute from '@shared/components/common/ProtectedRoute';

export const workplaceRoutes: RouteObject[] = [
  {
    path: 'workplace/:id',
    element: <WorkplaceProfilePage />,
  },
  {
    path: 'workplaces',
    element: <WorkplacesPage />,
  },
  {
    path: 'employer/workplaces',
    element: <Navigate to="/workplaces?tab=my" replace />,
  },
  {
    path: 'employer/workplace/:workplaceId/requests',
    element: (
      <ProtectedRoute>
        <ManageEmployerRequestsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/workplace/:workplaceId/settings',
    element: (
      <ProtectedRoute>
        <WorkplaceSettingsPage />
      </ProtectedRoute>
    ),
  },
];

