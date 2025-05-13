import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../utils/test-utils';
import JobDashboardPage from '../JobDashboard';
import { AuthContext, AuthContextType } from '../../../contexts/AuthContext';
import { JobPost } from '../../../types/job';
import { ReactNode } from 'react';

// Interface for Link component props
interface LinkProps {
  children: ReactNode;
  to: string;
  [key: string]: unknown;
}

// Mock jobs service
const mockGetJobByEmployer = vi.fn();
vi.mock('../../../services/jobs.service', () => ({
  useGetJobByEmployer: () => ({
    data: mockGetJobByEmployer(),
    isLoading: false,
    error: null,
  }),
}));

// Mock AuthContext value
const mockAuthContext: Partial<AuthContextType> = {
  id: '123',
  token: 'mock-token',
  setToken: vi.fn(),
  setId: vi.fn(),
};

// Mock router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...props }: LinkProps) => (
      <a href={to} {...props} data-testid="router-link">
        {children}
      </a>
    ),
  };
});

describe('JobDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock values
    const mockJobs: Partial<JobPost>[] = [
      {
        id: 1,
        title: 'Software Developer',
        description: 'A software developer position',
        location: 'Remote',
        minSalary: 50000,
        maxSalary: 80000,
        status: 'ACTIVE',
        employerId: 123,
      },
      {
        id: 2,
        title: 'UI/UX Designer',
        description: 'UI/UX designer needed',
        location: 'New York',
        status: 'ACTIVE',
        employerId: 123,
      },
    ];
    mockGetJobByEmployer.mockReturnValue(mockJobs);
  });

  it('renders job dashboard with jobs correctly', () => {
    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobDashboardPage />
      </AuthContext.Provider>
    );

    // Check heading
    expect(screen.getByText('My Job Posts')).toBeInTheDocument();

    // Check job listings
    expect(screen.getByText('Software Developer')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Designer')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('$50,000 - $80,000')).toBeInTheDocument();

    // Check create new job button
    expect(screen.getByText('Create New Job Post')).toBeInTheDocument();
  });

  it('shows empty state when no jobs are available', () => {
    mockGetJobByEmployer.mockReturnValue([]);

    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobDashboardPage />
      </AuthContext.Provider>
    );

    expect(screen.getByText('No job posts found.')).toBeInTheDocument();
    expect(
      screen.getByText('Click "Create New Job Post" to get started.')
    ).toBeInTheDocument();
  });

  it('shows error message when authentication is missing', () => {
    render(
      <AuthContext.Provider
        value={{ ...mockAuthContext, token: null } as AuthContextType}
      >
        <JobDashboardPage />
      </AuthContext.Provider>
    );

    expect(
      screen.getByText('Authentication token not found. Please log in.')
    ).toBeInTheDocument();
  });

  it('shows error message when employer ID is missing', () => {
    render(
      <AuthContext.Provider
        value={{ ...mockAuthContext, id: null } as AuthContextType}
      >
        <JobDashboardPage />
      </AuthContext.Provider>
    );

    expect(
      screen.getByText('Employer ID not found. Cannot fetch jobs.')
    ).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mock('../../../services/jobs.service', () => ({
      useGetJobByEmployer: () => ({
        data: undefined,
        isLoading: true,
        error: null,
      }),
    }));

    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobDashboardPage />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Loading Job Dashboard...')).toBeInTheDocument();
  });
});
