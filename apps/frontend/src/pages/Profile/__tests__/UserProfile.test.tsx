import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserProfile from '../UserProfile';
import * as profileService from '../../../services/profile.service';
import * as userService from '../../../services/user.service';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import {
  FullProfileResponse,
  ProfileResponse,
  Profile,
} from '../../../types/profile';
import { User } from '../../../types/auth';

// Mock the services
vi.mock('../../../services/profile.service');
vi.mock('../../../services/user.service');

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
    // Mock localStorage
    Storage.prototype.getItem = vi.fn();
  });

  it('renders loading state', () => {
    // Mock the hooks to return loading state
    const mockLoadingQueryResult = {
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isPending: true,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      status: 'loading' as const,
      fetchStatus: 'fetching' as const,
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: true,
      isInitialLoading: true,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      remove: vi.fn(),
      promise: Promise.resolve(),
      context: {},
    };

    vi.mocked(profileService.useUserProfileById).mockReturnValue(
      mockLoadingQueryResult as unknown as UseQueryResult<
        FullProfileResponse,
        Error
      >
    );

    vi.mocked(userService.useUserById).mockReturnValue(
      mockLoadingQueryResult as unknown as UseQueryResult<User, Error>
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/u/123']}>
          <Routes>
            <Route path="/u/:userId" element={<UserProfile />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders user profile', () => {
    // Mock user profile data
    const mockProfile: FullProfileResponse = {
      id: 123,
      userId: 123,
      profile: {
        id: 123,
        userId: 123,
        fullName: 'Test User',
        bio: 'This is my test bio',
        profilePicture: 'test.jpg',
        skills: [],
        interests: [],
        phone: '',
        location: '',
        occupation: '',
      },
      experience: [],
      education: [],
      badges: [],
    };

    // Mock auth user data
    const mockUser: User = {
      id: 123,
      username: 'testuser',
      email: 'test@example.com',
      bio: 'This is my test bio',
      userType: 'JOB_SEEKER',
      mentorType: 'MENTEE',
    };

    const mockSuccessQueryResult = {
      data: mockProfile,
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      isPlaceholderData: false,
      status: 'success' as const,
      fetchStatus: 'idle' as const,
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      remove: vi.fn(),
      promise: Promise.resolve(),
      context: {},
    };

    const mockSuccessUserQueryResult = {
      ...mockSuccessQueryResult,
      data: mockUser,
    };

    vi.mocked(profileService.useUserProfileById).mockReturnValue(
      mockSuccessQueryResult as unknown as UseQueryResult<
        FullProfileResponse,
        Error
      >
    );

    vi.mocked(userService.useUserById).mockReturnValue(
      mockSuccessUserQueryResult as unknown as UseQueryResult<User, Error>
    );

    const mockMutationResult = {
      data: undefined,
      error: null,
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      variables: undefined,
      failureCount: 0,
      failureReason: null,
      isPending: false,
      isError: false,
      isSuccess: false,
      status: 'idle' as const,
      isIdle: true,
      submittedAt: 0,
      context: {},
      isPaused: false,
    };

    vi.mocked(profileService.useUpdateUserProfile).mockReturnValue(
      mockMutationResult as unknown as UseMutationResult<
        ProfileResponse,
        Error,
        Partial<Profile>,
        unknown
      >
    );

    // Create a separate mock for user update with the correct type
    const mockUserMutationResult = {
      ...mockMutationResult,
      mutate: vi.fn() as unknown as UseMutationResult<
        User,
        Error,
        User,
        unknown
      >['mutate'],
      mutateAsync: vi.fn() as unknown as UseMutationResult<
        User,
        Error,
        User,
        unknown
      >['mutateAsync'],
    };

    vi.mocked(userService.useUpdateUser).mockReturnValue(
      mockUserMutationResult as unknown as UseMutationResult<
        User,
        Error,
        User,
        unknown
      >
    );

    // Mock localStorage for isOwnProfile check
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('123');

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/u/123']}>
          <Routes>
            <Route path="/u/:userId" element={<UserProfile />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify user info is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('This is my test bio')).toBeInTheDocument();
    expect(screen.getByText(/Job Seeker/)).toBeInTheDocument();
  });

  it('renders error state', () => {
    // Mock error state
    const mockErrorQueryResult = {
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load user'),
      isError: true,
      isPending: false,
      isLoadingError: true,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      status: 'error' as const,
      fetchStatus: 'idle' as const,
      dataUpdatedAt: 0,
      errorUpdatedAt: Date.now(),
      failureCount: 1,
      failureReason: new Error('Failed to load user'),
      errorUpdateCount: 1,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      remove: vi.fn(),
      promise: Promise.reject(new Error('Failed to load user')),
      context: {},
    };

    vi.mocked(profileService.useUserProfileById).mockReturnValue(
      mockErrorQueryResult as unknown as UseQueryResult<
        FullProfileResponse,
        Error
      >
    );

    vi.mocked(userService.useUserById).mockReturnValue(
      mockErrorQueryResult as unknown as UseQueryResult<User, Error>
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/u/123']}>
          <Routes>
            <Route path="/u/:userId" element={<UserProfile />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify error message is displayed
    expect(screen.getByText('Error loading user profile')).toBeInTheDocument();
    expect(screen.getByText('Return to Homepage')).toBeInTheDocument();
  });
});
