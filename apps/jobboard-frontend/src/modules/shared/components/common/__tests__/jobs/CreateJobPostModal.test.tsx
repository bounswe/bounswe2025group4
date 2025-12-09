import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, setupUserEvent } from '@/__tests__/utils';
import { CreateJobPostModal } from '@modules/jobs/components/jobs/CreateJobPostModal';
import { server } from '@/__tests__/setup';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/__tests__/handlers';
import type { EmployerWorkplaceBrief } from '@shared/types/workplace.types';

vi.mock('@shared/components/ui/dialog', () => {
  const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    <div data-testid="dialog" data-open={open} onClick={() => onOpenChange?.(open ?? false)}>
      {children}
    </div>
  );
  const DialogContent = ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>;
  const DialogHeader = ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>;
  const DialogTitle = ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>;
  const DialogDescription = ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-description">{children}</div>;
  return { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };
});

// Mock WorkplaceSelector to avoid complex setup
vi.mock('@/modules/workplace/components/WorkplaceSelector', () => ({
  default: ({ onChange, value }: { onChange: (id: number, workplace: EmployerWorkplaceBrief) => void; value?: number }) => (
    <div data-testid="workplace-selector">
      <select
        data-testid="workplace-select"
        value={value || ''}
        onChange={(e) => {
          const id = Number(e.target.value);
          onChange(id, { 
            workplace: { 
              id, 
              companyName: 'Tech Corp',
              sector: 'Technology',
              location: 'San Francisco, CA',
              overallAvg: 4.5,
              ethicalTags: [],
              ethicalAverages: {}
            },
            role: 'OWNER'
          });
        }}
      >
        <option value="">Select Workplace</option>
        <option value="1">Tech Corp</option>
        <option value="2">Startup Inc</option>
      </select>
    </div>
  ),
}));

describe('CreateJobPostModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    mockOnOpenChange.mockReset();
    mockOnSuccess.mockReset();

    // Mock the workplace API to return workplaces
    server.use(
      http.get(`${API_BASE_URL}/workplace/employers/me`, () => {
        return HttpResponse.json([
          {
            role: 'OWNER',
            workplace: {
              id: 1,
              companyName: 'Tech Corp',
              sector: 'Technology',
              location: 'San Francisco',
              overallAvg: 4.5,
              ethicalTags: [],
              ethicalAverages: {},
            },
          },
        ]);
      })
    );
  });

  it('renders correctly when open', async () => {
    renderWithProviders(
      <CreateJobPostModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByText('employer.createJob.title')).toBeInTheDocument();
    expect(screen.getByLabelText(/employer\.createJob\.jobTitle/i, { exact: false })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = setupUserEvent();

    server.use(
      http.post(`${API_BASE_URL}/jobs`, async () => {
        return HttpResponse.json({ id: 100, title: 'New Job' }, { status: 201 });
      })
    );

    renderWithProviders(
      <CreateJobPostModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Fill form
    await user.type(screen.getByLabelText(/employer\.createJob\.jobTitle/i, { exact: false }), 'Software Engineer');
    await user.type(screen.getByLabelText(/employer\.createJob\.jobDescription/i, { exact: false }), 'Great job');

    // Select workplace
    await user.selectOptions(screen.getByTestId('workplace-select'), '1');

    await user.type(screen.getByLabelText(/employer\.createJob\.minimum/i, { exact: false }), '100000');
    await user.type(screen.getByLabelText(/employer\.createJob\.maximum/i, { exact: false }), '150000');
    await user.type(screen.getByLabelText(/employer\.createJob\.contactEmail/i, { exact: false }), 'hr@tech.com');

    // Submit
    await user.click(screen.getByRole('button', { name: 'employer.createJob.submit' }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows error on submission failure', async () => {
    const user = setupUserEvent();

    server.use(
      http.post(`${API_BASE_URL}/jobs`, async () => {
        return HttpResponse.json({ message: 'Error' }, { status: 500 });
      })
    );

    renderWithProviders(
      <CreateJobPostModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Fill form
    await user.type(screen.getByLabelText(/employer\.createJob\.jobTitle/i, { exact: false }), 'Software Engineer');
    await user.type(screen.getByLabelText(/employer\.createJob\.jobDescription/i, { exact: false }), 'Great job');
    await user.selectOptions(screen.getByTestId('workplace-select'), '1');
    await user.type(screen.getByLabelText(/employer\.createJob\.minimum/i, { exact: false }), '100000');
    await user.type(screen.getByLabelText(/employer\.createJob\.maximum/i, { exact: false }), '150000');
    await user.type(screen.getByLabelText(/employer\.createJob\.contactEmail/i, { exact: false }), 'hr@tech.com');

    // Submit
    await user.click(screen.getByRole('button', { name: 'employer.createJob.submit' }));

    await waitFor(() => {
      expect(screen.getByText('employer.createJob.submitError')).toBeInTheDocument();
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});

