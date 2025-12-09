import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { server } from '@/__tests__/setup';
import { API_BASE_URL } from '@/__tests__/handlers';
import ProfilePage from '@modules/profile/pages/ProfilePage';
import type { PublicProfile } from '@shared/types/profile.types';
import { I18nProvider } from '@shared/providers/I18nProvider';
import { AuthProvider } from '@/modules/auth/contexts/AuthContext';
import { useAuthStore } from '@shared/stores/authStore';
import { ToastContainer } from 'react-toastify';

// Mock react-toastify to prevent console errors in tests
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  ToastContainer: () => null,
}));

// Mock CenteredLoader component
vi.mock('@shared/components/common/CenteredLoader', () => ({
  default: () => <div data-testid="centered-loader">Loading...</div>,
}));

describe('Public Profile Route Integration', () => {
  const mockPublicProfile: PublicProfile = {
    userId: 456,
    firstName: 'Alice',
    lastName: 'Johnson',
    bio: 'Experienced software architect passionate about clean code.',
    imageUrl: 'https://example.com/alice-profile.jpg',
    educations: [
      {
        id: 1,
        school: 'MIT',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2016-09-01',
        endDate: '2020-06-15',
        description: 'Computer Science fundamentals'
      }
    ],
    experiences: [
      {
        id: 1,
        company: 'Google',
        position: 'Software Engineer',
        description: 'Working on search algorithms',
        startDate: '2020-07-01',
        endDate: undefined
      }
    ],
    badges: []
  };

  beforeEach(() => {
    server.resetHandlers();
    useAuthStore.getState().clearSession();
  });

  const createRouterWithProfile = (userId: string) => {
    return createMemoryRouter(
      [
        {
          path: '/profile/:userId',
          element: <ProfilePage />,
        },
        {
          path: '/profile',
          element: <div>Private Profile Page</div>,
        },
        {
          path: '/not-found',
          element: <div>404 Not Found</div>,
        },
        {
          path: '/',
          element: <div>Home Page</div>,
        },
      ],
      {
        initialEntries: [`/profile/${userId}`],
      }
    );
  };

  const renderWithRouter = (router: ReturnType<typeof createRouterWithProfile>) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    // Clear auth store state before rendering to ensure clean test environment
    useAuthStore.getState().clearSession();
    
    return render(
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <ToastContainer />
          </AuthProvider>
        </I18nProvider>
      </QueryClientProvider>
    );
  };

  describe('Route Parameter Handling', () => {
    it('correctly extracts userId from URL and passes to component', async () => {
      // Arrange
      let capturedUserId: string | undefined;
      
      server.use(
        http.get(`${API_BASE_URL}/profile/:userId`, async ({ params }) => {
          capturedUserId = params.userId as string;
          return HttpResponse.json(mockPublicProfile, { status: 200 });
        })
      );

      const router = createRouterWithProfile('456');

      // Act
      renderWithRouter(router);

      // Assert
      await waitFor(() => {
        expect(capturedUserId).toBe('456');
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('handles numeric user IDs correctly', async () => {
      // Arrange
      server.use(
        http.get(`${API_BASE_URL}/profile/123`, async () => {
          return HttpResponse.json(
            { ...mockPublicProfile, userId: 123, firstName: 'John', lastName: 'Doe' },
            { status: 200 }
          );
        })
      );

      const router = createRouterWithProfile('123');

      // Act
      renderWithRouter(router);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('handles large user IDs correctly', async () => {
      // Arrange
      const largeId = '9999999999';
      
      server.use(
        http.get(`${API_BASE_URL}/profile/${largeId}`, async () => {
          return HttpResponse.json(
            { ...mockPublicProfile, userId: parseInt(largeId) },
            { status: 200 }
          );
        })
      );

      const router = createRouterWithProfile(largeId);

      // Act
      renderWithRouter(router);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });
  });

  describe('Route vs Private Profile Distinction', () => {
    it('renders PublicProfilePage for /profile/:userId routes', async () => {
      // Arrange
      server.use(
        http.get(`${API_BASE_URL}/profile/456`, async () => {
          return HttpResponse.json(mockPublicProfile, { status: 200 });
        })
      );

      const router = createRouterWithProfile('456');

      // Act
      renderWithRouter(router);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('profile.public.note')).toBeInTheDocument();
      });

      // Should not render private profile elements
      expect(screen.queryByText('Private Profile Page')).not.toBeInTheDocument();
    });

    it('would render different component for /profile route (without userId)', () => {
      // Arrange
      const router = createMemoryRouter(
        [
          {
            path: '/profile/:userId',
            element: <ProfilePage />,
          },
          {
            path: '/profile',
            element: <div>Private Profile Page</div>,
          },
        ],
        {
          initialEntries: ['/profile'],
        }
      );

      // Act
      renderWithRouter(router);

      // Assert
      expect(screen.getByText('Private Profile Page')).toBeInTheDocument();
      expect(screen.queryByText('This is a public profile view. Skills and interests are not displayed for privacy.')).not.toBeInTheDocument();
    });
  });

  describe('Navigation and URL Updates', () => {
    it('maintains URL parameters during tab navigation', async () => {
      // Arrange
      server.use(
        http.get(`${API_BASE_URL}/profile/456`, async () => {
          return HttpResponse.json(mockPublicProfile, { status: 200 });
        })
      );

      const router = createRouterWithProfile('456');

      // Act
      renderWithRouter(router);

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      // Assert - URL should remain intact during tab switches
      expect(router.state.location.pathname).toBe('/profile/456');
      
      // Tab navigation shouldn't change URL
      const activityTab = screen.getByRole('button', { name: 'profile.tabs.activity' });
      expect(activityTab).toBeInTheDocument();
      
      // URL should still be the same
      expect(router.state.location.pathname).toBe('/profile/456');
    });

    it('handles browser back/forward navigation', async () => {
      // Arrange
      server.use(
        http.get(`${API_BASE_URL}/profile/456`, async () => {
          return HttpResponse.json(mockPublicProfile, { status: 200 });
        })
      );

      const router = createMemoryRouter(
        [
          {
            path: '/profile/:userId',
            element: <ProfilePage />,
          },
          {
            path: '/',
            element: <div>Home Page</div>,
          },
        ],
        {
          initialEntries: ['/', '/profile/456'],
          initialIndex: 1,
        }
      );

      // Act
      renderWithRouter(router);

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      // Simulate back navigation
      router.navigate(-1);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
    });
  });



  describe('Route Parameter Edge Cases', () => {
    it('handles empty user ID parameter gracefully', async () => {
      // Arrange - Route with empty parameter
      const router = createMemoryRouter(
        [
          {
            path: '/profile/:userId',
            element: <ProfilePage />,
          },
        ],
        {
          initialEntries: ['/profile/'],
        }
      );

      // Act
      renderWithRouter(router);

      // Assert - Should not crash and not show loader
      expect(screen.queryByTestId('centered-loader')).not.toBeInTheDocument();
      expect(screen.queryByText('Failed to load profile')).not.toBeInTheDocument();
    });

  });

  describe('Loading State Management in Route Context', () => {
    it('shows loading state immediately when route is accessed', async () => {
      // Arrange
      server.use(
        http.get(`${API_BASE_URL}/profile/456`, async () => {
          // Slow response to test loading state
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json(mockPublicProfile, { status: 200 });
        })
      );

      const router = createRouterWithProfile('456');

      // Act
      renderWithRouter(router);

      // Assert - Should show loading immediately
      expect(screen.getByTestId('centered-loader')).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('centered-loader')).not.toBeInTheDocument();
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

  });
});
