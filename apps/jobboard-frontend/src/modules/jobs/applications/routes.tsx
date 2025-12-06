import { Navigate, type RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const JobApplicationPage = lazy(() => import('./pages/JobApplicationPage'));
const JobApplicationReviewPage = lazy(() => import('./pages/JobApplicationReviewPage'));
import ProtectedRoute from '@shared/components/common/ProtectedRoute';

export const applicationsRoutes: RouteObject[] = [
  {
    path: 'jobs/:id/apply',
    element: (
      <ProtectedRoute>
        <JobApplicationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'applications',
    element: (
      <ProtectedRoute>
        <Navigate to="/jobs?tab=applications" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: 'employer/jobs/:jobId/applications/:applicationId',
    element: (
      <ProtectedRoute>
        <JobApplicationReviewPage />
      </ProtectedRoute>
    ),
  },
];

