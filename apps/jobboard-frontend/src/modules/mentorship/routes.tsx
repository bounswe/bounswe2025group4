import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const CreateMentorProfilePage = lazy(() => import('./pages/CreateMentorProfilePage'));
const MentorProfilePage = lazy(() => import('./pages/MentorProfilePage'));
const MentorRequestsPage = lazy(() => import('./pages/MentorRequestsPage'));
const MentorshipPage = lazy(() => import('./pages/MentorshipPage'));
const MentorshipRequestPage = lazy(() => import('./pages/MentorshipRequestPage'));
const MyMentorshipsPage = lazy(() => import('./pages/MyMentorshipsPage'));
import ProtectedRoute from '@shared/components/common/ProtectedRoute';

export const mentorshipRoutes: RouteObject[] = [
  {
    path: 'mentorship',
    element: <MentorshipPage />,
  },
  {
    path: 'mentorship/mentor/create',
    element: (
      <ProtectedRoute>
        <CreateMentorProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'mentorship/mentor/edit',
    element: (
      <ProtectedRoute>
        <CreateMentorProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'mentorship/:id',
    element: (
      <ProtectedRoute>
        <MentorProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'my-mentorships',
    element: (
      <ProtectedRoute>
        <MyMentorshipsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'mentor/requests',
    element: (
      <ProtectedRoute>
        <MentorRequestsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'mentorship/:id/request',
    element: (
      <ProtectedRoute>
        <MentorshipRequestPage />
      </ProtectedRoute>
    ),
  },
];

