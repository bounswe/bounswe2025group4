import type { RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@shared/components/common/ProtectedRoute';
import CenteredLoader from '@shared/components/common/CenteredLoader';

const ReportManagementPage = lazy(() => import('./pages/ReportManagementPage').then(m => ({ default: m.ReportManagementPage })));

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="ROLE_ADMIN">
        <Suspense fallback={<CenteredLoader />}>
          <ReportManagementPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/reports',
    element: (
      <ProtectedRoute requiredRole="ROLE_ADMIN">
        <Suspense fallback={<CenteredLoader />}>
          <ReportManagementPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
