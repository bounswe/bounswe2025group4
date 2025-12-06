import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const ForumPage = lazy(() => import('./pages/ForumPage'));

export const forumRoutes: RouteObject[] = [
  {
    path: 'forum',
    element: <ForumPage />,
  },
];

