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

// Helper functions to create mock query results with only essential fields
type QueryResultOptions = {
  data?: unknown;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  status?: 'loading' | 'error' | 'success' | 'idle';
  isSuccess?: boolean;
  refetch?: () => void;
  [key: string]: unknown;
};

const createMockQueryResult = (options: QueryResultOptions = {}) => {
  const defaults = {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    status: 'loading',
    refetch: vi.fn(),
  };
  return { ...defaults, ...options };
};

type MutationResultOptions = {
  mutate?: () => void;
  mutateAsync?: () => Promise<unknown>;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  reset?: () => void;
  [key: string]: unknown;
};

const createMockMutationResult = (options: MutationResultOptions = {}) => {
  const defaults = {
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  };
  return { ...defaults, ...options };
};

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
    const mockLoadingQueryResult = createMockQueryResult({
      isLoading: true,
      status: 'loading',
    });

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
        profilePicture: 'placeholder.png',
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
      userType: 'JOB_SEEKER',
      mentorshipStatus: 'MENTEE',
    };

    const mockSuccessQueryResult = createMockQueryResult({
      data: mockProfile,
      isLoading: false,
      status: 'success',
      isSuccess: true,
    });

    const mockSuccessUserQueryResult = createMockQueryResult({
      data: mockUser,
      isLoading: false,
      status: 'success',
      isSuccess: true,
    });

    vi.mocked(profileService.useUserProfileById).mockReturnValue(
      mockSuccessQueryResult as unknown as UseQueryResult<
        FullProfileResponse,
        Error
      >
    );

    vi.mocked(userService.useUserById).mockReturnValue(
      mockSuccessUserQueryResult as unknown as UseQueryResult<User, Error>
    );

    const mockMutationResult = createMockMutationResult();

    vi.mocked(profileService.useUpdateUserProfile).mockReturnValue(
      mockMutationResult as unknown as UseMutationResult<
        ProfileResponse,
        Error,
        Partial<Profile>,
        unknown
      >
    );

    // Create a separate mock for user update with the correct type
    const mockUserMutationResult = createMockMutationResult();

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

    // Mock useProfilePictureUpload
    vi.mocked(profileService.useProfilePictureUpload).mockReturnValue(
      mockMutationResult as unknown as UseMutationResult<
        void,
        Error,
        File,
        unknown
      >
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

    // Verify user info is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('This is my test bio')).toBeInTheDocument();
    expect(screen.getByText(/Job Seeker/)).toBeInTheDocument();
  });

  it('renders error state', () => {
    // Mock error state
    const mockErrorQueryResult = createMockQueryResult({
      error: new Error('Failed to load user'),
      isError: true,
      status: 'error',
    });

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
