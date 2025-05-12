import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserProfile from './UserProfile';
import * as userService from '../../services/profile.service';
import { vi } from 'vitest';

// Mock the user service hooks
vi.mock('../../services/user.service', () => ({
  useUserProfile: vi.fn(),
  useUpdateUserProfile: vi.fn(),
  useWorkHistory: vi.fn(),
  useUserBadges: vi.fn(),
  useForumActivityCount: vi.fn(),
}));

describe('UserProfile', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders loading state', () => {
    // Mock the hooks to return loading state
    vi.mocked(userService.useUserProfile).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    vi.mocked(userService.useWorkExperience).mockReturnValue({
      data: [],
      isLoading: false,
    });

    vi.mocked(userService.useUserBadges).mockReturnValue({
      data: [],
      isLoading: false,
    });

    vi.mocked(userService.useForumActivityCount).mockReturnValue({
      data: 0,
      isLoading: false,
    });

    vi.mocked(userService.useUpdateUserProfile).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/u/testuser']}>
          <Routes>
            <Route path="/u/:username" element={<UserProfile />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Should show loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders user profile', () => {
    // Mock user data
    const mockUser = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      bio: 'This is my test bio',
      userType: 'JOB_SEEKER',
      mentorType: 'MENTEE',
    };

    // Mock the hooks to return user data
    vi.mocked(userService.useUserProfile).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    vi.mocked(userService.useWorkExperience).mockReturnValue({
      data: [],
      isLoading: false,
    });

    vi.mocked(userService.useUserBadges).mockReturnValue({
      data: [],
      isLoading: false,
    });

    vi.mocked(userService.useForumActivityCount).mockReturnValue({
      data: 5,
      isLoading: false,
    });

    vi.mocked(userService.useUpdateUserProfile).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    // Replace localStorage.getItem for isOwnProfile check
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    getItemSpy.mockReturnValue(null); // Not the user's own profile

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/u/testuser']}>
          <Routes>
            <Route path="/u/:username" element={<UserProfile />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Should show user info
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('This is my test bio')).toBeInTheDocument();
    expect(screen.getByText('Job Seeker')).toBeInTheDocument();

    // Clean up
    getItemSpy.mockRestore();
  });

  test('renders error state', () => {
    // Mock error state
    vi.mocked(userService.useUserProfile).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load user'),
    });

    vi.mocked(userService.useWorkExperience).mockReturnValue({
      data: [],
      isLoading: false,
    });

    vi.mocked(userService.useUserBadges).mockReturnValue({
      data: [],
      isLoading: false,
    });

    vi.mocked(userService.useForumActivityCount).mockReturnValue({
      data: 0,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/u/testuser']}>
          <Routes>
            <Route path="/u/:username" element={<UserProfile />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Should show error message
    expect(screen.getByText('Error loading user profile')).toBeInTheDocument();
    expect(screen.getByText('Return to Homepage')).toBeInTheDocument();
  });
});
