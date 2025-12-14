import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const ForumPage = lazy(() => import('./pages/ForumPage'));
const ForumPostDetail = lazy(() => import('./pages/ForumPostDetail'));

export const forumRoutes: RouteObject[] = [
  {
    path: 'forum',
    element: <ForumPage />,
  },
  {
    path: 'forum/:postId',
    element: <ForumPostDetail />,
  },
];

