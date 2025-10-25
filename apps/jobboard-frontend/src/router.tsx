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
import CreateJobPostPage from './pages/CreateJobPostPage';
import EmployerJobPostDetailsPage from './pages/EmployerJobPostDetailsPage';
import EmployerEditJobPostPage from './pages/EmployerEditJobPostPage';
import ProtectedRoute from './components/ProtectedRoute';
import ForumPage from './pages/ForumPage';
import MentorshipPage from './pages/MentorshipPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import MentorProfilePage from './pages/MentorProfilePage';
import MentorshipRequestPage from './pages/MentorshipRequestPage';
import MyMentorshipsPage from './pages/MyMentorshipsPage';
import ChatPage from './pages/ChatPage';

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
        path: 'company/:slug',
        element: <CompanyProfilePage />,
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
        path: 'employer/jobs/create',
        element: (
          <ProtectedRoute>
            <CreateJobPostPage />
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
        path: 'mentorship/:id',
        element: (
          <ProtectedRoute>
            <MentorProfilePage />
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
      {
        path: 'my-mentorships',
        element: (
          <ProtectedRoute>
            <MyMentorshipsPage />
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
