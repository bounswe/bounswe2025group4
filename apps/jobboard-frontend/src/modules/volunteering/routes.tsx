import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const NonProfitJobApplicationPage = lazy(() => import('./pages/NonProfitJobApplicationPage'));
const NonProfitJobDetailPage = lazy(() => import('./pages/NonProfitJobDetailPage'));
const NonProfitJobsPage = lazy(() => import('./pages/NonProfitJobsPage'));
import ProtectedRoute from '@shared/components/common/ProtectedRoute';

export const volunteeringRoutes: RouteObject[] = [
  {
    path: 'nonprofit-jobs',
    element: <NonProfitJobsPage />,
  },
  {
    path: 'nonprofit-jobs/:id',
    element: <NonProfitJobDetailPage />,
  },
  {
    path: 'nonprofit-jobs/:id/apply',
    element: (
      <ProtectedRoute>
        <NonProfitJobApplicationPage />
      </ProtectedRoute>
    ),
  },
];

