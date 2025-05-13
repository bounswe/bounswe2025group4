import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../utils/test-utils';
import JobPostDetailDashboardView from '../JobPostDetailDashboardView';
import { AuthContext, AuthContextType } from '../../../contexts/AuthContext';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';

// Interface for Link component props
interface LinkProps {
  children: ReactNode;
  to: string;
  [key: string]: unknown;
}

// Mock the jobs service
const mockGetJobById = vi.fn();
vi.mock('../../../services/jobs.service', () => ({
  useGetJobById: () => ({
    data: mockGetJobById(),
    isLoading: false,
    error: null,
  }),
}));

// Mock the applications service
const mockGetApplicationsByJobId = vi.fn();
vi.mock('../../../services/applications.service', () => ({
  useGetApplicationsByJobId: () => ({
    data: mockGetApplicationsByJobId(),
    isLoading: false,
    error: null,
  }),
}));

// Mock AuthContext value
const mockAuthContext: Partial<AuthContextType> = {
  id: '123',
  token: 'mock-token',
  roles: ['EMPLOYER'],
  username: 'employer_user',
  login: vi.fn(),
  logout: vi.fn(),
  setToken: vi.fn(),
  setId: vi.fn(),
};

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    Link: ({ children, to, ...props }: LinkProps) => (
      <a href={to} {...props} data-testid="router-link">
        {children}
      </a>
    ),
  };
});

describe('JobPostDetailDashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock values
    mockGetJobById.mockReturnValue({
      id: 1,
      title: 'Senior Developer',
      description: 'A senior developer position',
      location: 'Remote',
      minSalary: 80000,
      maxSalary: 120000,
      status: 'ACTIVE',
      employerId: 123,
    });

    mockGetApplicationsByJobId.mockReturnValue([
      {
        id: '101',
        applicantName: 'John Doe',
        submissionDate: '2023-01-15T10:00:00Z',
        status: 'PENDING',
        feedback: '',
      },
      {
        id: '102',
        applicantName: 'Jane Smith',
        submissionDate: '2023-01-16T14:30:00Z',
        status: 'APPROVED',
        feedback: 'Great candidate',
      },
    ]);

    // Mock console.log and console.error to avoid clutter in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock window.alert
    window.alert = vi.fn();
  });

  it('renders job details and applications correctly', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobPostDetailDashboardView />
      </AuthContext.Provider>
    );

    // Check job details
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(
      screen.getByText(/a senior developer position/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/remote/i)).toBeInTheDocument();
    expect(screen.getByText(/\$80,000 - \$120,000/i)).toBeInTheDocument();

    // Check applications section
    expect(screen.getByText('Applications Received (2)')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check status and feedback fields
    const statusSelects = screen.getAllByLabelText('Status');
    expect(statusSelects.length).toBe(2);
    expect(statusSelects[0]).toHaveValue('PENDING');
    expect(statusSelects[1]).toHaveValue('APPROVED');

    const feedbackFields = screen.getAllByLabelText('Feedback (Optional)');
    expect(feedbackFields.length).toBe(2);
    expect(feedbackFields[1]).toHaveValue('Great candidate');
  });

  it('shows loading state while job data is being fetched', () => {
    vi.mock('../../../services/jobs.service', () => ({
      useGetJobById: () => ({
        data: null,
        isLoading: true,
        error: null,
      }),
    }));

    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobPostDetailDashboardView />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Loading job details...')).toBeInTheDocument();
  });

  it('shows error message when job fails to load', () => {
    vi.mock('../../../services/jobs.service', () => ({
      useGetJobById: () => ({
        data: null,
        isLoading: false,
        error: { message: 'Failed to load job' },
      }),
    }));

    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobPostDetailDashboardView />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Failed to load job')).toBeInTheDocument();
  });

  it('shows proper message when no applications are received', () => {
    mockGetApplicationsByJobId.mockReturnValue([]);

    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobPostDetailDashboardView />
      </AuthContext.Provider>
    );

    expect(
      screen.getByText('No applications received for this job yet.')
    ).toBeInTheDocument();
  });

  it('shows warning when user is not the publisher of the job post', () => {
    // Change job's employerId to differ from the current user's id
    mockGetJobById.mockReturnValue({
      id: 1,
      title: 'Senior Developer',
      description: 'A senior developer position',
      location: 'Remote',
      minSalary: 80000,
      maxSalary: 120000,
      status: 'ACTIVE',
      employerId: 456, // Different from mockAuthContext.id
    });

    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobPostDetailDashboardView />
      </AuthContext.Provider>
    );

    expect(
      screen.getByText(/you are not the publisher of this job post/i)
    ).toBeInTheDocument();
  });

  it('allows changing application status and feedback', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobPostDetailDashboardView />
      </AuthContext.Provider>
    );

    const user = userEvent.setup();

    // Get the status select for the first application
    const statusSelects = screen.getAllByLabelText('Status');
    const feedbackFields = screen.getAllByLabelText('Feedback (Optional)');
    const updateButtons = screen.getAllByRole('button', {
      name: /update app/i,
    });

    // Change status from PENDING to APPROVED
    await user.click(statusSelects[0]);
    await user.click(screen.getByText('APPROVED'));

    // Add feedback
    await user.type(feedbackFields[0], 'Good potential');

    // Click update button
    await user.click(updateButtons[0]);

    // Expect alert to be shown (since we mocked the actual update implementation)
    expect(window.alert).toHaveBeenCalledWith(
      'Application update placeholder - implement with mutation hook!'
    );
  });

  it('shows authentication error when token is missing', () => {
    render(
      <AuthContext.Provider
        value={{ ...mockAuthContext, token: null } as AuthContextType}
      >
        <JobPostDetailDashboardView />
      </AuthContext.Provider>
    );

    expect(
      screen.getByText(/employer id or authentication token is missing/i)
    ).toBeInTheDocument();
  });
});
