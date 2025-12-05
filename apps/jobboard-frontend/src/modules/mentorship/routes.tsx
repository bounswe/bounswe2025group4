import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import ProtectedRoute from '@shared/components/common/ProtectedRoute';

const MentorshipPage = lazy(() => import('./pages/MentorshipPage'));
const MentorProfilePage = lazy(() => import('./pages/MentorProfilePage'));
const MentorshipRequestPage = lazy(() => import('./pages/MentorshipRequestPage'));
const MyMentorshipsPage = lazy(() => import('./pages/MyMentorshipsPage'));
const CreateMentorProfilePage = lazy(() => import('./pages/CreateMentorProfilePage'));
const MentorRequestsPage = lazy(() => import('./pages/MentorRequestsPage'));
const ResumeReviewPage = lazy(() => import('./pages/ResumeReviewPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

export const mentorshipRoutes: RouteObject[] = [
  {
    path: 'mentorship',
    element: <MentorshipPage />,
  },
  {
    path: 'mentorship/:id',
    element: <MentorProfilePage />,
  },
  {
    path: 'mentorship/:id/request',
    element: (
      <ProtectedRoute>
        <MentorshipRequestPage />
      </ProtectedRoute>
    ),
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
    path: 'mentor/requests',
    element: (
      <ProtectedRoute>
        <MentorRequestsPage />
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
    path: 'resume-review/:resumeReviewId',
    element: (
      <ProtectedRoute>
        <ResumeReviewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'chat',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
];

