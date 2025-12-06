import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));

export const profileRoutes: RouteObject[] = [
  {
    path: 'profile',
    element: <ProfilePage />,
  },
  {
    path: 'profile/:userId',
    element: <PublicProfilePage />,
  },
];

