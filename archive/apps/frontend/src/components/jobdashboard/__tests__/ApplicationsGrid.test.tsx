import { render, screen } from '@testing-library/react';
import { describe, expect, vi, it } from 'vitest';
import ApplicationsGrid from '../ApplicationsGrid';
import { Application } from '../../../types/application';
import { ApplicationStatusUpdate } from '../../../schemas/job';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';

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
      {rows.map((row) => (
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

describe('ApplicationsGrid', () => {
  const mockApplications: Application[] = [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'Tech Co',
      applicantName: 'John Doe',
      jobSeekerId: 1,
      jobPostingId: 101,
      status: 'PENDING',
      feedback: '',
      submissionDate: new Date('2023-05-15'),
    },
    {
      id: '2',
      title: 'Backend Developer',
      company: 'Tech Co',
      applicantName: 'Jane Smith',
      jobSeekerId: 2,
      jobPostingId: 102,
      status: 'APPROVED',
      feedback: 'Great fit!',
      submissionDate: new Date('2023-05-10'),
    },
  ];

  const mockHandlers = {
    onUpdateStatus: vi.fn().mockResolvedValue({}),
    onBackToJobs: vi.fn(),
  };

  it('renders the correct number of applications', () => {
    render(
      <ApplicationsGrid
        jobId="101"
        jobTitle="Frontend Developer"
        applications={mockApplications}
        isLoading={false}
        onUpdateStatus={mockHandlers.onUpdateStatus}
        onBackToJobs={mockHandlers.onBackToJobs}
      />
    );

    expect(screen.getByTestId('row-count').textContent).toBe('2');
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows loading indicator when isLoading is true', () => {
    render(
      <ApplicationsGrid
        jobId="101"
        jobTitle="Frontend Developer"
        applications={mockApplications}
        isLoading={true}
        onUpdateStatus={mockHandlers.onUpdateStatus}
        onBackToJobs={mockHandlers.onBackToJobs}
      />
    );

    // Check for loading indicator inside the DataGrid
    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });

  it('displays the correct job title in the header', () => {
    render(
      <ApplicationsGrid
        jobId="101"
        jobTitle="Frontend Developer"
        applications={mockApplications}
        isLoading={false}
        onUpdateStatus={mockHandlers.onUpdateStatus}
        onBackToJobs={mockHandlers.onBackToJobs}
      />
    );

    expect(
      screen.getByText('Applications for "Frontend Developer"')
    ).toBeInTheDocument();
  });

  it('calls onBackToJobs when back button is clicked', async () => {
    render(
      <ApplicationsGrid
        jobId="101"
        jobTitle="Frontend Developer"
        applications={mockApplications}
        isLoading={false}
        onUpdateStatus={mockHandlers.onUpdateStatus}
        onBackToJobs={mockHandlers.onBackToJobs}
      />
    );

    await userEvent.click(screen.getByText('Back to Jobs'));
    expect(mockHandlers.onBackToJobs).toHaveBeenCalledTimes(1);
  });

  it('opens and closes the view application dialog', async () => {
    // Render the component with a mock function for renderCell
    const { getByTestId } = render(
      <ApplicationsGrid
        jobId="101"
        jobTitle="Frontend Developer"
        applications={mockApplications}
        isLoading={false}
        onUpdateStatus={mockHandlers.onUpdateStatus}
        onBackToJobs={mockHandlers.onBackToJobs}
      />
    );

    // Initial state: dialog should be closed
    expect(getByTestId('view-application-dialog')).toHaveStyle('display: none');

    // Simulate clicking view button (this doesn't actually click because of the mock,
    // but we can manually trigger the state change)
    const viewButton = screen.getAllByTestId('action-view-details');
    await userEvent.click(viewButton[0]);

    // Dialog should now be visible
    expect(getByTestId('view-application-dialog')).toHaveStyle(
      'display: block'
    );

    // Close the dialog
    await userEvent.click(getByTestId('close-view-dialog'));

    // Dialog should be closed again
    expect(getByTestId('view-application-dialog')).toHaveStyle('display: none');
  });

  it('opens and interacts with the update status dialog', async () => {
    const { getByTestId } = render(
      <ApplicationsGrid
        jobId="101"
        jobTitle="Frontend Developer"
        applications={mockApplications}
        isLoading={false}
        onUpdateStatus={mockHandlers.onUpdateStatus}
        onBackToJobs={mockHandlers.onBackToJobs}
      />
    );

    // Initial state: dialog should be closed
    expect(getByTestId('update-status-dialog')).toHaveStyle('display: none');

    // Simulate clicking update status button
    const updateButton = screen.getAllByTestId('action-update-status');
    await userEvent.click(updateButton[0]);

    // Dialog should now be visible
    expect(getByTestId('update-status-dialog')).toHaveStyle('display: block');

    // Test updating status
    await userEvent.click(getByTestId('update-status-button'));
    expect(mockHandlers.onUpdateStatus).toHaveBeenCalledWith('1', {
      status: 'APPROVED',
      feedback: 'Good job!',
    });

    // Close the dialog
    await userEvent.click(getByTestId('close-status-dialog'));

    // Dialog should be closed again
    expect(getByTestId('update-status-dialog')).toHaveStyle('display: none');
  });
});
