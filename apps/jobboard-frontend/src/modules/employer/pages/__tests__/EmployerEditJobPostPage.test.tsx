import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders, setupUserEvent } from '@/test/utils';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL, createMockJob } from '@/test/handlers';
import EmployerEditJobPostPage from '../EmployerEditJobPostPage';
import type { UpdateJobPostRequest } from '@/modules/shared/types/api.types';
import type { EmployerWorkplaceBrief } from '@/modules/shared/types/workplace.types';

// Mock WorkplaceSelector to avoid dropdown issues in tests
vi.mock('@/modules/workplace/components/WorkplaceSelector', () => ({
  default: ({ value, onChange }: { value: number | undefined; onChange: (id: number, workplace: Partial<EmployerWorkplaceBrief>) => void }) => (
    <div data-testid="workplace-selector">
      <select
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value), {
          role: 'ADMIN',
          workplace: {
            id: Number(e.target.value),
            companyName: 'Test Workplace',
            sector: 'Technology',
            location: 'Test City',
            overallAvg: 4.5,
            ethicalTags: [],
            ethicalAverages: {}
          }
        })}
      >
        <option value="">Select workplace</option>
        <option value="1">Test Workplace</option>
      </select>
    </div>
  ),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ jobId: '1' }),
  };
});

describe('EmployerEditJobPostPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it.skip('shows error when jobId param is missing', async () => {
    // Skip: Cannot properly mock useParams to return undefined in this test setup
    // The mock is defined at module level and cannot be easily overridden per-test
  });

  it('shows loading state while fetching job data', async () => {
    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json(createMockJob());
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    // Should show loader
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(
          { message: 'Job not found' },
          { status: 404 }
        );
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    await waitFor(() => {
      expect(screen.getByText('editJob.loadError')).toBeInTheDocument();
    });
  });

  it('pre-populates form with existing job data', async () => {
    const mockJob = createMockJob({
      id: 1,
      title: 'Existing Job Title',
      description: 'Existing job description',
      location: 'Existing Location',
      remote: true,
      minSalary: 100000,
      maxSalary: 150000,
      contact: 'existing@company.com',
      inclusiveOpportunity: true,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Check form is pre-populated
    expect((screen.getByLabelText('employer.createJob.jobTitle') as HTMLInputElement).value).toBe('Existing Job Title');
    expect((screen.getByLabelText('employer.createJob.jobDescription') as HTMLTextAreaElement).value).toBe('Existing job description');
    expect((screen.getByLabelText('employer.createJob.minimum') as HTMLInputElement).value).toBe('100000');
    expect((screen.getByLabelText('employer.createJob.maximum') as HTMLInputElement).value).toBe('150000');
    expect((screen.getByLabelText('employer.createJob.contactEmail') as HTMLInputElement).value).toBe('existing@company.com');
    expect(screen.getByLabelText('employer.createJob.remoteWork')).toBeChecked();
    expect(screen.getByLabelText('employer.createJob.inclusiveOpportunity')).toBeChecked();
  });

  it('parses JSON contact format correctly', async () => {
    const mockJob = createMockJob({
      contact: '{"email":"json@company.com"}',
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Should parse JSON and extract email
    expect((screen.getByLabelText('employer.createJob.contactEmail') as HTMLInputElement).value).toBe('json@company.com');
  });

  it('parses plain string contact format correctly', async () => {
    const mockJob = createMockJob({
      contact: 'plain@company.com',
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Should use plain string as email
    expect((screen.getByLabelText('employer.createJob.contactEmail') as HTMLInputElement).value).toBe('plain@company.com');
  });

  it('displays workplace selector', async () => {
    const mockJob = createMockJob({
      id: 1,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Workplace selector should be displayed
    expect(screen.getByText('employer.createJob.workplaceDescription')).toBeInTheDocument();
  });

  it('updates job successfully with changed values', async () => {
    const mockJob = createMockJob({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      }),
      http.put(`${API_BASE_URL}/jobs/:id`, async ({ request }) => {
        const body = await request.json() as UpdateJobPostRequest;
        return HttpResponse.json({
          ...mockJob,
          ...body,
        });
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    const user = setupUserEvent();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Change title
    const titleInput = screen.getByLabelText('employer.createJob.jobTitle');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Job Title');

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'editJob.save' });
    await user.click(submitButton);

    // Should navigate to job detail page on success
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/employer/jobs/1');
    });
  });

  it('shows error toast on update failure', async () => {
    const mockJob = createMockJob({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      }),
      http.put(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(
          { message: 'Update failed' },
          { status: 500 }
        );
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    const user = setupUserEvent();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'editJob.save' });
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('editJob.submitError')).toBeInTheDocument();
    });

    // Should NOT navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to detail page on cancel button click', async () => {
    const mockJob = createMockJob({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    const user = setupUserEvent();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: 'editJob.cancel' });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/employer/jobs/1');
  });

  it('handles optional salary fields (can be undefined)', async () => {
    const mockJob = createMockJob({
      id: 1,
      minSalary: undefined,
      maxSalary: undefined,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      }),
      http.put(`${API_BASE_URL}/jobs/:id`, async ({ request }) => {
        const body = await request.json() as UpdateJobPostRequest;
        // Salary should be undefined if not provided
        expect(body.minSalary).toBeUndefined();
        expect(body.maxSalary).toBeUndefined();
        return HttpResponse.json({
          ...mockJob,
          ...body,
        });
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    const user = setupUserEvent();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Salary fields should be empty
    expect((screen.getByLabelText('employer.createJob.minimum') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('employer.createJob.maximum') as HTMLInputElement).value).toBe('');

    // Submit without filling salary
    const submitButton = screen.getByRole('button', { name: 'editJob.save' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('disables buttons during submission', async () => {
    const mockJob = createMockJob({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      }),
      http.put(`${API_BASE_URL}/jobs/:id`, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    const user = setupUserEvent();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: 'editJob.save' });
    const cancelButton = screen.getByRole('button', { name: 'editJob.cancel' });

    // Submit form
    await user.click(submitButton);

    // Both buttons should be disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  it('shows "Saving..." text during submission', async () => {
    const mockJob = createMockJob({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      }),
      http.put(`${API_BASE_URL}/jobs/:id`, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    const user = setupUserEvent();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Initially shows "Save Changes"
    expect(screen.getByRole('button', { name: 'editJob.save' })).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: 'editJob.save' });
    await user.click(submitButton);

    // Should show "Saving..." during submission
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'editJob.saving' })).toBeInTheDocument();
    });
  });

  // Edge case tests
  it('handles editing job with very long title and description', async () => {
    const longTitle = 'A'.repeat(200);
    const longDescription = 'B'.repeat(5000);

    const mockJob = createMockJob({
      id: 1,
      title: longTitle,
      description: longDescription,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect((screen.getByLabelText('employer.createJob.jobTitle') as HTMLInputElement).value).toBe(longTitle);
    expect((screen.getByLabelText('employer.createJob.jobDescription') as HTMLTextAreaElement).value).toBe(longDescription);
  });

  it('handles special characters in job fields', async () => {
    const mockJob = createMockJob({
      id: 1,
      title: 'C++ & C# Developer @ Tech&Co',
      location: 'São Paulo, Brasil',
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect((screen.getByLabelText('employer.createJob.jobTitle') as HTMLInputElement).value).toBe('C++ & C# Developer @ Tech&Co');
  });

  it('handles editing salary range', async () => {
    const mockJob = createMockJob({
      id: 1,
      minSalary: 80000,
      maxSalary: 120000,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      }),
      http.put(`${API_BASE_URL}/jobs/:id`, async ({ request }) => {
        const body = await request.json() as UpdateJobPostRequest;
        return HttpResponse.json({
          ...mockJob,
          ...body,
        });
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    const user = setupUserEvent();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Change salary
    const minInput = screen.getByLabelText('employer.createJob.minimum');
    const maxInput = screen.getByLabelText('employer.createJob.maximum');

    await user.clear(minInput);
    await user.type(minInput, '100000');

    await user.clear(maxInput);
    await user.type(maxInput, '150000');

    const submitButton = screen.getByRole('button', { name: 'editJob.save' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/employer/jobs/1');
    });
  });

  it('toggles remote work and inclusive opportunity checkboxes', async () => {
    const mockJob = createMockJob({
      id: 1,
      remote: false,
      inclusiveOpportunity: false,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      }),
      http.put(`${API_BASE_URL}/jobs/:id`, async ({ request }) => {
        const body = await request.json() as UpdateJobPostRequest;
        return HttpResponse.json({
          ...mockJob,
          ...body,
        });
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    const user = setupUserEvent();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const remoteCheckbox = screen.getByLabelText('employer.createJob.remoteWork');
    const inclusiveCheckbox = screen.getByLabelText('employer.createJob.inclusiveOpportunity');

    // Initially unchecked
    expect(remoteCheckbox).not.toBeChecked();
    expect(inclusiveCheckbox).not.toBeChecked();

    // Toggle both
    fireEvent.click(remoteCheckbox);
    fireEvent.click(inclusiveCheckbox);

    await waitFor(() => {
      expect(remoteCheckbox).toBeChecked();
      expect(inclusiveCheckbox).toBeChecked();
    });

    const submitButton = screen.getByRole('button', { name: 'editJob.save' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('handles network timeout gracefully', async () => {
    const mockJob = createMockJob({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      }),
      http.put(`${API_BASE_URL}/jobs/:id`, async () => {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Long delay
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    const user = setupUserEvent();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: 'editJob.save' });
    await user.click(submitButton);

    // Should show saving state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'editJob.saving' })).toBeInTheDocument();
    });
  });

  it('handles multiline description correctly', async () => {
    const multilineDescription = 'Line 1\nLine 2\nLine 3\n\nLine 5';
    const mockJob = createMockJob({
      id: 1,
      description: multilineDescription,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect((screen.getByLabelText('employer.createJob.jobDescription') as HTMLTextAreaElement).value).toBe(multilineDescription);
  });

  it('renders form fields correctly', async () => {
    const mockJob = createMockJob({
      id: 1,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Check that all form fields are rendered
    expect(screen.getByLabelText('employer.createJob.jobTitle')).toBeInTheDocument();
    expect(screen.getByLabelText('employer.createJob.jobDescription')).toBeInTheDocument();
    expect(screen.getByLabelText('employer.createJob.contactEmail')).toBeInTheDocument();
  });

  it('handles very large salary values', async () => {
    const mockJob = createMockJob({
      id: 1,
      minSalary: 1000000,
      maxSalary: 10000000,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect((screen.getByLabelText('employer.createJob.minimum') as HTMLInputElement).value).toBe('1000000');
    expect((screen.getByLabelText('employer.createJob.maximum') as HTMLInputElement).value).toBe('10000000');
  });

  it('handles editing contact email to different format', async () => {
    const mockJob = createMockJob({
      id: 1,
      contact: 'old@company.com',
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      }),
      http.put(`${API_BASE_URL}/jobs/:id`, async ({ request }) => {
        const body = await request.json() as UpdateJobPostRequest;
        return HttpResponse.json({
          ...mockJob,
          ...body,
        });
      })
    );

    renderWithProviders(<EmployerEditJobPostPage />, {
      initialEntries: ['/employer/jobs/1/edit']
    });

    const user = setupUserEvent();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const contactInput = screen.getByLabelText('employer.createJob.contactEmail');
    fireEvent.change(contactInput, { target: { value: 'new@company.co.uk' } });

    await waitFor(() => {
      expect((contactInput as HTMLInputElement).value).toBe('new@company.co.uk');
    });

    const submitButton = screen.getByRole('button', { name: 'editJob.save' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});


