import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
const ChatPage = lazy(() => import('./pages/ChatPage'));
import ProtectedRoute from '@shared/components/common/ProtectedRoute';

export const chatRoutes: RouteObject[] = [
  {
    path: 'chat',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
];

