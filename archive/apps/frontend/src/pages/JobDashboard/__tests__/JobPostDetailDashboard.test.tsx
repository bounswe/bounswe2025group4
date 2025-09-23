import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../utils/test-utils';
import JobDetailDashboard from '../JobDetailDashboard';
import { AuthContext, AuthContextType } from '../../../contexts/AuthContext';
import { ReactNode } from 'react';
import { ApplicationStatusUpdate } from '../../../schemas/job';

type Row = Record<string, string | number | Date>;
type Column = {
  field: string;
  headerName: string;
  renderCell?: ({ row }: { row: Row }) => ReactNode;
  getActions?: (opts: {
    id: string | number | Date;
    row: Row;
    columns: Column[];
  }) => ReactNode[];
};

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns }: { rows: Row[]; columns: Column[] }) => (
    <div data-testid="data-grid">
      <div data-testid="row-count">{rows.length}</div>
      {rows.length > 0 &&
        rows.map((row) => (
          <div
            key={typeof row.id === 'string' ? row.id : row.id.toString()}
            data-testid={`application-row-${row.id}`}
          >
            {columns.map((col) => {
              // If you used renderCell in your real column definitions:
              if (col.renderCell) {
                return <div key={col.field}>{col.renderCell({ row })}</div>;
              }
              // If you used getActions in your real column definitions:
              if (col.getActions) {
                return (
                  <div key={col.field}>
                    {col
                      .getActions({ id: row.id, row, columns })
                      .map((actionNode, i) => (
                        <span key={i}>{actionNode}</span>
                      ))}
                  </div>
                );
              }
              // Fallback to a text cell:
              return (
                <div key={col.field}>{row[col.field]?.toString() ?? ''}</div>
              );
            })}
          </div>
        ))}
      {rows.length === 0 && (
        <div data-testid="no-applications-message">
          No applications received for this job yet.
        </div>
      )}
    </div>
  ),
  GridActionsCellItem: ({
    label,
    onClick,
  }: {
    label: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      data-testid={`action-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {label}
    </button>
  ),
}));

// Mock the dialog components
vi.mock('../ViewApplicationDialog', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div
      data-testid="view-application-dialog"
      style={{ display: open ? 'block' : 'none' }}
    >
      <button onClick={onClose} data-testid="close-view-dialog">
        Close
      </button>
    </div>
  ),
}));

vi.mock('../UpdateStatusDialog', () => ({
  default: ({
    open,
    onClose,
    onUpdateStatus,
  }: {
    open: boolean;
    onClose: () => void;
    onUpdateStatus: (
      applicationId: string,
      data: ApplicationStatusUpdate
    ) => Promise<void>;
  }) => (
    <div
      data-testid="update-status-dialog"
      style={{ display: open ? 'block' : 'none' }}
    >
      <button onClick={onClose} data-testid="close-status-dialog">
        Cancel
      </button>
      <button
        onClick={() =>
          onUpdateStatus('1', { status: 'APPROVED', feedback: 'Good job!' })
        }
        data-testid="update-status-button"
      >
        Update Status
      </button>
    </div>
  ),
}));

// Interface for Link component props
interface LinkProps {
  children: ReactNode;
  to: string;
  [key: string]: unknown;
}

// Define error type
interface ApiError {
  message: string;
}

// Variables to control mock behavior
let mockIsLoadingJob = false;
let mockIsLoadingApps = false;
let mockJobError: ApiError | null = null;
let mockAppsError: ApiError | null = null;

// Mock the jobs service
const mockGetJobById = vi.fn();
vi.mock('../../../services/jobs.service', () => ({
  useGetJobById: () => ({
    data: mockIsLoadingJob ? null : mockGetJobById(),
    isLoading: mockIsLoadingJob,
    error: mockJobError,
  }),
}));

// Mock the applications service
const mockGetApplicationsByJobId = vi.fn();
const mockUpdateApplicationStatus = vi.fn().mockResolvedValue({});
vi.mock('../../../services/applications.service', () => ({
  useGetApplicationsByJobId: () => ({
    data: mockIsLoadingApps ? null : mockGetApplicationsByJobId(),
    isLoading: mockIsLoadingApps,
    error: mockAppsError,
    refetch: vi.fn().mockResolvedValue({}),
  }),
  useUpdateApplicationStatus: () => ({
    mutateAsync: mockUpdateApplicationStatus,
    isPending: false,
    isError: false,
    isSuccess: false,
    isLoading: false,
  }),
}));

// Mock AuthContext value
const mockAuthContext: Partial<AuthContextType> = {
  id: '123',
  token: 'mock-token',
  setToken: vi.fn(),
  setId: vi.fn(),
};

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
    Link: ({ children, to, ...props }: LinkProps) => (
      <a href={to} {...props} data-testid="router-link">
        {children}
      </a>
    ),
  };
});

// Mock window.alert
global.alert = vi.fn();

describe('JobDetailDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoadingJob = false;
    mockIsLoadingApps = false;
    mockJobError = null;
    mockAppsError = null;

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
  });

  it('renders job details and applications correctly', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobDetailDashboard />
      </AuthContext.Provider>
    );

    // Check job details
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(
      screen.getByText(/a senior developer position/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/remote/i)).toBeInTheDocument();
    expect(screen.getByText(/\$80000 - \$120000/i)).toBeInTheDocument();

    // Check applications section
    expect(screen.getByText(/applications for/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check status fields (assumes ApplicationsGrid component works properly)
  });

  it('shows loading state while job data is being fetched', () => {
    mockIsLoadingJob = true;

    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobDetailDashboard />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Loading job details...')).toBeInTheDocument();
  });

  it('shows error message when job fails to load', () => {
    mockJobError = { message: 'Failed to load job' };

    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobDetailDashboard />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Failed to load job')).toBeInTheDocument();
  });

  it('shows proper message when no applications are received', () => {
    mockGetApplicationsByJobId.mockReturnValue([]);

    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobDetailDashboard />
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
        <JobDetailDashboard />
      </AuthContext.Provider>
    );

    expect(
      screen.getByText(/you are not the publisher of this job post/i)
    ).toBeInTheDocument();
  });

  it('shows authentication error when token is missing', () => {
    render(
      <AuthContext.Provider
        value={{ ...mockAuthContext, token: null } as AuthContextType}
      >
        <JobDetailDashboard />
      </AuthContext.Provider>
    );

    expect(
      screen.getByText(/Employer ID or authentication token is missing/i)
    ).toBeInTheDocument();
  });
});
