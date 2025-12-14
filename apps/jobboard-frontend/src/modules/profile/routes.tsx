import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const ProfilePage = lazy(() => import('./pages/ProfilePage'));

export const profileRoutes: RouteObject[] = [
  {
    path: 'profile',
    element: <ProfilePage />,
  },
  {
    path: 'profile/:userId',
    element: <ProfilePage />,
  },
];

