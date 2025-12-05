import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
const ResumeReviewPage = lazy(() => import('./pages/ResumeReviewPage'));
import ProtectedRoute from '@shared/components/common/ProtectedRoute';

export const resumeReviewRoutes: RouteObject[] = [
  {
    path: 'resume-review/:resumeReviewId',
    element: (
      <ProtectedRoute>
        <ResumeReviewPage />
      </ProtectedRoute>
    ),
  },
];

