import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import RootLayout from './layouts/RootLayout';
import ErrorBoundary from './components/ErrorBoundary';
import CenteredLoader from './components/CenteredLoader';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ProfilePage from './pages/ProfilePage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import JobApplicationPage from './pages/JobApplicationPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import JobApplicationReviewPage from './pages/JobApplicationReviewPage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import EmployerJobPostDetailsPage from './pages/EmployerJobPostDetailsPage';
import EmployerEditJobPostPage from './pages/EmployerEditJobPostPage';
import ProtectedRoute from './components/ProtectedRoute';
import ForumPage from './pages/ForumPage';
import MentorshipPage from './pages/MentorshipPage';
import MentorProfilePage from './pages/MentorProfilePage';
import MyMentorshipsPage from './pages/MyMentorshipsPage';
import CreateMentorProfilePage from './pages/CreateMentorProfilePage';
import MentorRequestsPage from './pages/MentorRequestsPage';
import WorkplaceProfilePage from './pages/WorkplaceProfilePage';
import EmployerWorkplacesPage from './pages/EmployerWorkplacesPage';
import ManageEmployerRequestsPage from './pages/ManageEmployerRequestsPage';
import WorkplaceSettingsPage from './pages/WorkplaceSettingsPage';
import WorkplacesPage from './pages/WorkplacesPage';
import ChatPage from './pages/ChatPage';
import PublicProfilePage from './pages/PublicProfilePage';
import ResumeReviewPage from './pages/ResumeReviewPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: async () => {
          return { message: 'Welcome to the Job Platform' };
        },
      },
      {
        path: 'jobs',
        element: <JobsPage />,
      },
      {
        path: 'jobs/:id',
        element: <JobDetailPage />,
      },
      {
        path: 'workplace/:id',
        element: <WorkplaceProfilePage />,
      },
      {
        path: 'workplaces',
        element: <WorkplacesPage />,
      },
      {
        path: 'jobs/:id/apply',
        element: (
          <ProtectedRoute>
            <JobApplicationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'applications',
        element: (
          <ProtectedRoute>
            <MyApplicationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employer/dashboard',
        element: (
          <ProtectedRoute>
            <EmployerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employer/workplaces',
        element: (
          <ProtectedRoute>
            <EmployerWorkplacesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employer/workplace/:workplaceId/requests',
        element: (
          <ProtectedRoute>
            <ManageEmployerRequestsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employer/workplace/:workplaceId/settings',
        element: (
          <ProtectedRoute>
            <WorkplaceSettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employer/jobs/:jobId',
        element: (
          <ProtectedRoute>
            <EmployerJobPostDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employer/jobs/:jobId/edit',
        element: (
          <ProtectedRoute>
            <EmployerEditJobPostPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employer/jobs/:jobId/applications/:applicationId',
        element: (
          <ProtectedRoute>
            <JobApplicationReviewPage />
          </ProtectedRoute>
        ),
      },
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
        path: 'resume-review/:resumeReviewId',
        element: (
          <ProtectedRoute>
            <ResumeReviewPage />
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
        path: 'chat',
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'forum',
        element: <ForumPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'verify-email',
        element: <EmailVerificationPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'verify-otp',
        element: <VerifyOtpPage />,
      },
      {
        path: 'api/auth/reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'profile',
        element: (
            <ProfilePage />
        ),
      },
      {
        path: 'profile/:userId',
        element: (
            <PublicProfilePage />
        ),
      },
    ],
  },
]);

export function Router() {
  return (
    <Suspense fallback={<CenteredLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
