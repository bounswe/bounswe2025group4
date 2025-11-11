import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, setupUserEvent } from '@/test/utils';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL, createMockJob } from '@/test/handlers';
import CreateJobPostPage from '@/pages/CreateJobPostPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CreateJobPostPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders all form fields', () => {
    renderWithProviders(<CreateJobPostPage />, {
      initialEntries: ['/employer/jobs/create']
    });

    // Check all required form fields are present
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remote work/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/inclusive opportunity/i)).toBeInTheDocument();

    // Check submit button
    expect(screen.getByRole('button', { name: /post job|submit|create/i })).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    renderWithProviders(<CreateJobPostPage />, {
      initialEntries: ['/employer/jobs/create']
    });

    const user = setupUserEvent();

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /post job|submit|create/i });
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    // Check that navigate was NOT called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles remote work checkbox toggle', async () => {
    renderWithProviders(<CreateJobPostPage />, {
      initialEntries: ['/employer/jobs/create']
    });

    const user = setupUserEvent();

    const remoteCheckbox = screen.getByLabelText(/remote work/i);

    // Initially unchecked
    expect(remoteCheckbox).not.toBeChecked();

    // Click to check
    await user.click(remoteCheckbox);
    expect(remoteCheckbox).toBeChecked();

    // Click again to uncheck
    await user.click(remoteCheckbox);
    expect(remoteCheckbox).not.toBeChecked();
  });

  it('handles inclusive opportunity checkbox toggle', async () => {
    renderWithProviders(<CreateJobPostPage />, {
      initialEntries: ['/employer/jobs/create']
    });

    const user = setupUserEvent();

    const inclusiveCheckbox = screen.getByLabelText(/inclusive opportunity/i);

    // Initially unchecked
    expect(inclusiveCheckbox).not.toBeChecked();

    // Click to check
    await user.click(inclusiveCheckbox);
    expect(inclusiveCheckbox).toBeChecked();

    // Click again to uncheck
    await user.click(inclusiveCheckbox);
    expect(inclusiveCheckbox).not.toBeChecked();
  });

  it('accepts valid salary inputs', async () => {
    renderWithProviders(<CreateJobPostPage />, {
      initialEntries: ['/employer/jobs/create']
    });

    const user = setupUserEvent();

    const minSalaryInput = screen.getByLabelText(/minimum/i) as HTMLInputElement;
    const maxSalaryInput = screen.getByLabelText(/maximum/i) as HTMLInputElement;

    await user.type(minSalaryInput, '50000');
    await user.type(maxSalaryInput, '80000');

    expect(minSalaryInput.value).toBe('50000');
    expect(maxSalaryInput.value).toBe('80000');
  });

  it('validates email format', async () => {
    renderWithProviders(<CreateJobPostPage />, {
      initialEntries: ['/employer/jobs/create']
    });

    const user = setupUserEvent();

    const emailInput = screen.getByLabelText(/contact email/i) as HTMLInputElement;

    // Type invalid email
    await user.type(emailInput, 'invalid-email');

    // HTML5 email validation will catch this
    expect(emailInput.type).toBe('email');
  });

  it('handles ethical tags multi-select', async () => {
    renderWithProviders(<CreateJobPostPage />, {
      initialEntries: ['/employer/jobs/create']
    });

    // MultiSelectDropdown should be rendered
    expect(screen.getByText(/select ethical tags/i)).toBeInTheDocument();
  });

  it('successfully creates job on valid submission', async () => {
    const createdJob = createMockJob({
      id: 10,
      title: 'Test Engineer',
      company: 'Test Company'
    });

    server.use(
      http.post(`${API_BASE_URL}/jobs`, async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
          ...createdJob,
          ...body,
        }, { status: 201 });
      })
    );

    renderWithProviders(<CreateJobPostPage />, {
      initialEntries: ['/employer/jobs/create']
    });

    const user = setupUserEvent();

    // Fill in all required fields
    await user.type(screen.getByLabelText(/job title/i), 'Test Engineer');
    await user.type(screen.getByLabelText(/job description/i), 'This is a test job description for an engineer position.');
    await user.type(screen.getByLabelText(/company name/i), 'Test Company');
    await user.type(screen.getByLabelText(/location/i), 'San Francisco, CA');
    await user.type(screen.getByLabelText(/minimum/i), '100000');
    await user.type(screen.getByLabelText(/maximum/i), '150000');
    await user.type(screen.getByLabelText(/contact email/i), 'test@company.com');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /post job|submit|create/i });
    await user.click(submitButton);

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/employer/dashboard');
    });
  });

  it('shows success toast and navigates to dashboard on success', async () => {
    const createdJob = createMockJob();

    server.use(
      http.post(`${API_BASE_URL}/jobs`, async () => {
        return HttpResponse.json(createdJob, { status: 201 });
      })
    );

    renderWithProviders(<CreateJobPostPage />, {
      initialEntries: ['/employer/jobs/create']
    });

    const user = setupUserEvent();

    // Fill in required fields
    await user.type(screen.getByLabelText(/job title/i), 'Software Engineer');
    await user.type(screen.getByLabelText(/job description/i), 'Great opportunity for developers.');
    await user.type(screen.getByLabelText(/company name/i), 'Tech Corp');
    await user.type(screen.getByLabelText(/location/i), 'New York, NY');
    await user.type(screen.getByLabelText(/minimum/i), '90000');
    await user.type(screen.getByLabelText(/maximum/i), '130000');
    await user.type(screen.getByLabelText(/contact email/i), 'hr@techcorp.com');

    // Submit
    await user.click(screen.getByRole('button', { name: /post job|submit|create/i }));

    // Check for success toast (appears in document)
    await waitFor(() => {
      expect(screen.getByText(/job posted successfully/i)).toBeInTheDocument();
    });

    // Check navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/employer/dashboard');
    });
  });

  it('shows error toast on API failure', async () => {
    server.use(
      http.post(`${API_BASE_URL}/jobs`, async () => {
        return HttpResponse.json(
          { message: 'Internal server error' },
          { status: 500 }
        );
      })
    );

    renderWithProviders(<CreateJobPostPage />, {
      initialEntries: ['/employer/jobs/create']
    });

    const user = setupUserEvent();

    // Fill in required fields
    await user.type(screen.getByLabelText(/job title/i), 'Failed Job');
    await user.type(screen.getByLabelText(/job description/i), 'This will fail.');
    await user.type(screen.getByLabelText(/company name/i), 'Fail Corp');
    await user.type(screen.getByLabelText(/location/i), 'Anywhere');
    await user.type(screen.getByLabelText(/minimum/i), '50000');
    await user.type(screen.getByLabelText(/maximum/i), '70000');
    await user.type(screen.getByLabelText(/contact email/i), 'fail@fail.com');

    // Submit
    await user.click(screen.getByRole('button', { name: /post job|submit|create/i }));

    // Check for error toast
    await waitFor(() => {
      expect(screen.getByText(/failed to create job|error/i)).toBeInTheDocument();
    });

    // Should NOT navigate on error
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables submit button during submission', async () => {
    // Mock a slow API response
    server.use(
      http.post(`${API_BASE_URL}/jobs`, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json(createMockJob(), { status: 201 });
      })
    );

    renderWithProviders(<CreateJobPostPage />, {
      initialEntries: ['/employer/jobs/create']
    });

    const user = setupUserEvent();

    // Fill in required fields
    await user.type(screen.getByLabelText(/job title/i), 'Test');
    await user.type(screen.getByLabelText(/job description/i), 'Description');
    await user.type(screen.getByLabelText(/company name/i), 'Company');
    await user.type(screen.getByLabelText(/location/i), 'Location');
    await user.type(screen.getByLabelText(/minimum/i), '60000');
    await user.type(screen.getByLabelText(/maximum/i), '90000');
    await user.type(screen.getByLabelText(/contact email/i), 'test@test.com');

    const submitButton = screen.getByRole('button', { name: /post job|submit|create/i });

    // Submit
    await user.click(submitButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('maintains form state during submission errors', async () => {
    server.use(
      http.post(`${API_BASE_URL}/jobs`, async () => {
        return HttpResponse.json(
          { message: 'Validation error' },
          { status: 400 }
        );
      })
    );

    renderWithProviders(<CreateJobPostPage />, {
      initialEntries: ['/employer/jobs/create']
    });

    const user = setupUserEvent();

    const testTitle = 'Test Job Title';
    const testDescription = 'Test job description';

    // Fill in some fields
    await user.type(screen.getByLabelText(/job title/i), testTitle);
    await user.type(screen.getByLabelText(/job description/i), testDescription);
    await user.type(screen.getByLabelText(/company name/i), 'Test Co');
    await user.type(screen.getByLabelText(/location/i), 'Test City');
    await user.type(screen.getByLabelText(/minimum/i), '50000');
    await user.type(screen.getByLabelText(/maximum/i), '75000');
    await user.type(screen.getByLabelText(/contact email/i), 'test@test.com');

    // Submit (will fail)
    await user.click(screen.getByRole('button', { name: /post job|submit|create/i }));

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/failed|error/i)).toBeInTheDocument();
    });

    // Form data should still be present
    expect((screen.getByLabelText(/job title/i) as HTMLInputElement).value).toBe(testTitle);
    expect((screen.getByLabelText(/job description/i) as HTMLTextAreaElement).value).toBe(testDescription);
  });
});
