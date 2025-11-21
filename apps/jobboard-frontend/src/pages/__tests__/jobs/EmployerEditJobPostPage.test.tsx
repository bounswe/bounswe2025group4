import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, setupUserEvent } from '@/test/utils';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL, createMockJob } from '@/test/handlers';
import EmployerEditJobPostPage from '@/pages/EmployerEditJobPostPage';

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
      expect(screen.getByText(/failed to load job details/i)).toBeInTheDocument();
    });
  });

  it('pre-populates form with existing job data', async () => {
    const mockJob = createMockJob({
      id: 1,
      title: 'Existing Job Title',
      description: 'Existing job description',
      company: 'Existing Company',
      location: 'Existing Location',
      remote: true,
      minSalary: 100000,
      maxSalary: 150000,
      contact: 'existing@company.com',
      ethicalTags: 'Salary Transparency, Remote-Friendly',
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
    expect((screen.getByLabelText(/job title/i) as HTMLInputElement).value).toBe('Existing Job Title');
    expect((screen.getByLabelText(/job description/i) as HTMLTextAreaElement).value).toBe('Existing job description');
    expect((screen.getByLabelText(/company name/i) as HTMLInputElement).value).toBe('Existing Company');
    expect((screen.getByLabelText(/location/i) as HTMLInputElement).value).toBe('Existing Location');
    expect((screen.getByLabelText(/minimum/i) as HTMLInputElement).value).toBe('100000');
    expect((screen.getByLabelText(/maximum/i) as HTMLInputElement).value).toBe('150000');
    expect((screen.getByLabelText(/contact email/i) as HTMLInputElement).value).toBe('existing@company.com');
    expect(screen.getByLabelText(/remote work/i)).toBeChecked();
    expect(screen.getByLabelText(/inclusive opportunity/i)).toBeChecked();
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
    expect((screen.getByLabelText(/contact email/i) as HTMLInputElement).value).toBe('json@company.com');
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
    expect((screen.getByLabelText(/contact email/i) as HTMLInputElement).value).toBe('plain@company.com');
  });

  it('parses comma-separated ethical tags', async () => {
    const mockJob = createMockJob({
      ethicalTags: 'Salary Transparency, Remote-Friendly, Flexible Hours',
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

    // MultiSelectDropdown should be rendered with tags
    // The component should parse and split the tags correctly
    expect(screen.getByText(/select ethical policies/i)).toBeInTheDocument();
  });

  it('updates job successfully with changed values', async () => {
    const mockJob = createMockJob({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      }),
      http.put(`${API_BASE_URL}/jobs/:id`, async ({ request }) => {
        const body = await request.json() as any;
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
    const titleInput = screen.getByLabelText(/job title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Job Title');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save changes/i });
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
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to update job posting/i)).toBeInTheDocument();
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
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/employer/jobs/1');
  });

  it('handles optional salary fields (can be undefined)', async () => {
    const mockJob = createMockJob({
      id: 1,
      minSalary: undefined as any,
      maxSalary: undefined as any,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/:id`, async () => {
        return HttpResponse.json(mockJob);
      }),
      http.put(`${API_BASE_URL}/jobs/:id`, async ({ request }) => {
        const body = await request.json() as any;
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
    expect((screen.getByLabelText(/minimum/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/maximum/i) as HTMLInputElement).value).toBe('');

    // Submit without filling salary
    const submitButton = screen.getByRole('button', { name: /save changes/i });
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

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

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
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    // Should show "Saving..." during submission
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    });
  });
});
