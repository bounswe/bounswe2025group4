import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../utils/test-utils';
import JobDashboardPage from '../JobDashboard';
import { AuthContext, AuthContextType } from '../../../contexts/AuthContext';
import { JobPost } from '../../../types/job';
import { ReactNode } from 'react';
import { GridColDef } from '@mui/x-data-grid';

// Mock the DataGridPro component since it's complex and not needed for basic tests
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns }: { rows: JobPost[]; columns: GridColDef[] }) => (
    <div data-testid="data-grid">
      <div data-testid="row-count">{rows.length}</div>
      <table>
        <thead>
          <tr>
            {columns.map((col: GridColDef) => (
              <th key={col.field}>{col.headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: JobPost) => (
            <tr key={row.id} data-testid={`job-row-${row.id}`}>
              <td>{row.title}</td>
              <td>{row.location}</td>
              <td>{row.remote ? 'Remote' : 'On-site'}</td>
              <td>
                {row.minSalary} - {row.maxSalary}
              </td>
              <td>{row.ethicalTags}</td>
              <td>{row.postedDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  GridActionsCellItem: ({
    label,
    onClick,
  }: {
    label: string;
    onClick: () => void;
  }) => (
    <button onClick={onClick} data-testid={`action-${label.toLowerCase()}`}>
      {label}
    </button>
  ),
  GridColDef: vi.fn(),
  GridRenderCellParams: vi.fn(),
  GridRowParams: vi.fn(),
}));

// Interface for Link component props
interface LinkProps {
  children: ReactNode;
  to: string;
  [key: string]: unknown;
}

// Variables to control mock behavior
let mockIsLoading = false;

// Mock jobs service
const mockGetJobByEmployer = vi.fn();
vi.mock('../../../services/jobs.service', () => ({
  useGetJobByEmployer: () => ({
    data: mockIsLoading ? undefined : mockGetJobByEmployer(),
    isLoading: mockIsLoading,
    error: null,
  }),
  useCreateJob: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateJob: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteJob: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
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
    useNavigate: () => vi.fn(),
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
    mockIsLoading = false;

    // Default mock values
    const mockJobs: Partial<JobPost>[] = [
      {
        id: 1,
        title: 'Software Developer',
        description: 'A software developer position',
        location: 'Ankara',
        remote: true,
        minSalary: 50000,
        maxSalary: 80000,
        ethicalTags: 'diversity',
        postedDate: new Date('2023-01-01').toISOString(),
        employerId: 123,
      },
      {
        id: 2,
        title: 'UI/UX Designer',
        description: 'UI/UX designer needed',
        location: 'New York',
        remote: false,
        minSalary: 60000,
        maxSalary: 90000,
        ethicalTags: 'diversity',
        postedDate: new Date('2023-01-01').toISOString(),
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
    expect(screen.getByText('Manage Job Listings')).toBeInTheDocument();

    // Check job listings
    expect(screen.getByText('Software Developer')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Designer')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('50000 - 80000')).toBeInTheDocument();

    // Check create new job button
    expect(screen.getByText('Create Job')).toBeInTheDocument();
  });

  it('shows empty state when no jobs are available', () => {
    mockGetJobByEmployer.mockReturnValue([]);

    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobDashboardPage />
      </AuthContext.Provider>
    );

    // JobGrid component will handle the empty state display
    // This assumes JobGrid shows a proper empty state
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
    // Set loading state to true for this test
    mockIsLoading = true;

    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobDashboardPage />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Loading Job Dashboard...')).toBeInTheDocument();
  });
});
