import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const JobsPage = lazy(() => import('./pages/JobsPage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));

export const jobsRoutes: RouteObject[] = [
  {
    path: 'jobs',
    element: <JobsPage />,
  },
  {
    path: 'jobs/:id',
    element: <JobDetailPage />,
  },
];

