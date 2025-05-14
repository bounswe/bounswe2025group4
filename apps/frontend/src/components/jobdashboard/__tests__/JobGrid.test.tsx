import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, vi, it } from 'vitest';
import JobGrid from '../JobGrid';
import { GridColDef } from '@mui/x-data-grid';
import { JobPost } from '../../../types/job';

// Mock the services
vi.mock('../../../services/jobs.service', () => ({
  useDeleteJob: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isLoading: false,
  }),
}));

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

describe('JobGrid', () => {
  const mockJobs: JobPost[] = [
    {
      id: 1,
      title: 'Frontend Developer',
      location: 'New York',
      minSalary: 80000,
      maxSalary: 100000,
      ethicalTags: 'eco_friendly,inclusive',
      description: 'A frontend developer job',
      company: 'Tech Co',
      employerId: 1,
      remote: true,
      status: 'ACTIVE',
      contact: 'test@example.com',
      postedDate: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Backend Developer',
      location: 'Remote',
      minSalary: 90000,
      maxSalary: 120000,
      ethicalTags: 'eco_friendly',
      description: 'A backend developer job',
      company: 'Tech Co',
      employerId: 1,
      remote: true,
      status: 'ACTIVE',
      contact: 'test@example.com',
      postedDate: new Date().toISOString(),
    },
  ];

  const mockHandlers = {
    onEdit: vi.fn(),
    onCreateNew: vi.fn(),
    onApplicationsView: vi.fn(),
  };

  it('renders the correct number of jobs', () => {
    render(
      <BrowserRouter>
        <JobGrid
          jobs={mockJobs}
          isLoading={false}
          onEdit={mockHandlers.onEdit}
          onApplicationsView={mockHandlers.onApplicationsView}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('row-count').textContent).toBe('2');
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Backend Developer')).toBeInTheDocument();
  });

  it('shows loading indicator when isLoading is true', () => {
    render(
      <BrowserRouter>
        <JobGrid
          jobs={mockJobs}
          isLoading={true}
          onEdit={mockHandlers.onEdit}
          onApplicationsView={mockHandlers.onApplicationsView}
        />
      </BrowserRouter>
    );

    // Check for loading indicator inside the DataGrid
    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });
});
