import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from '@shared/components/common/ProtectedRoute';

const MentorDirectoryPage = lazy(() => import('./pages/MentorshipPage'));
const MentorProfilePage = lazy(() => import('./pages/MentorProfilePage'));
const MentorshipRequestPage = lazy(() => import('./pages/MentorshipRequestPage'));
const CreateMentorProfilePage = lazy(() => import('./pages/CreateMentorProfilePage'));
const MentorRequestsPage = lazy(() => import('./pages/MentorRequestsPage'));
const ResumeReviewPage = lazy(() => import('./pages/ResumeReviewPage'));
const MyMentorshipsPage = lazy(() => import('./pages/MyMentorshipsPage'));
const MentorDashboardPage = lazy(() => import('./pages/MentorDashboardPage'));

export const mentorshipRoutes: RouteObject[] = [
  {
    path: 'mentorship',
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="browse" replace /> },
      { path: 'browse', element: <MentorDirectoryPage /> },
      {
        path: 'my',
        element: (
          <ProtectedRoute>
            <MyMentorshipsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <MentorDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ':id',
        element: <MentorProfilePage />,
      },
      {
        path: ':id/request',
        element: (
          <ProtectedRoute>
            <MentorshipRequestPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mentor/create',
        element: (
          <ProtectedRoute>
            <CreateMentorProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mentor/edit',
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
        path: 'resume-review/:resumeReviewId',
        element: (
          <ProtectedRoute>
            <ResumeReviewPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: 'my-mentorships', element: <Navigate to="/mentorship/my" replace /> },
];

