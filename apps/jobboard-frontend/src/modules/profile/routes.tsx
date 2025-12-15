import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BadgesPage = lazy(() => import('./pages/BadgesPage'));

export const profileRoutes: RouteObject[] = [
  {
    path: 'profile',
    element: <ProfilePage />,
  },
  {
    path: 'profile/badges',
    element: <BadgesPage />,
  },
  {
    path: 'profile/:userId',
    element: <ProfilePage />,
  },
  {
    path: 'profile/:userId/badges',
    element: <BadgesPage />,
  },
];

