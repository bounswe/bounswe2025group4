import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, setupUserEvent } from '@/test/utils';
import { useAuthStore } from '@/stores/authStore';
import { createMockJWT, createMockJob, createMockApplication } from '@/test/handlers';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/test/handlers';
import EmployerJobPostDetailsPage from '@/pages/EmployerJobPostDetailsPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ jobId: '1' }),
  };
});

describe('EmployerJobPostDetailsPage', () => {
  const setupAuthState = () => {
    // Set up authenticated employer user
    useAuthStore.setState({
      user: {
        id: 1,
        username: 'employer1',
        email: 'employer@test.com',
        role: 'ROLE_EMPLOYER'
      },
      accessToken: createMockJWT('employer1', 'employer@test.com', 1, 'ROLE_EMPLOYER'),
      isAuthenticated: true,
    });
  };

  beforeEach(() => {
    mockNavigate.mockReset();
    setupAuthState();
  });

  it('shows loading state while fetching job and applications', () => {
    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays job details correctly after successful fetch', async () => {
    const mockJob = createMockJob({
      id: 1,
      title: 'Senior Software Engineer',
      description: 'We are looking for an experienced software engineer.',
      location: 'San Francisco, CA',
      minSalary: 120000,
      maxSalary: 180000,
      remote: false,
      inclusiveOpportunity: true,
      contact: 'hiring@techcorp.com',
      workplace: {
        ...createMockJob().workplace,
        companyName: 'Tech Corp',
      },
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Senior Software Engineer' })).toBeInTheDocument();
    });

    expect(screen.getByText('We are looking for an experienced software engineer.')).toBeInTheDocument();
    expect(screen.getByText('$120,000 - $180,000 per year')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });

  it('displays ethical tags correctly', async () => {
    const mockJob = createMockJob({
      id: 1,
      workplace: {
        ...createMockJob().workplace,
        ethicalTags: ['Salary Transparency', 'Remote-Friendly', 'Mental Health Support'],
      },
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('ethicalTags.tags.salaryTransparency')).toBeInTheDocument();
    });

    expect(screen.getByText('ethicalTags.tags.remoteFriendly')).toBeInTheDocument();
    expect(screen.getByText('ethicalTags.tags.mentalHealthSupport')).toBeInTheDocument();
  });

  it('does not display ethical tags section when tags are empty', async () => {
    const mockJob = createMockJob({
      id: 1,
      workplace: {
        ...createMockJob().workplace,
        ethicalTags: [],
      },
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: createMockJob().title })).toBeInTheDocument();
    });

    expect(screen.queryByText('employerJobPostDetails.ethicalPolicies')).not.toBeInTheDocument();
  });

  it('displays inclusive opportunity section when enabled', async () => {
    const mockJob = createMockJob({
      id: 1,
      inclusiveOpportunity: true,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('employerJobPostDetails.inclusiveOpportunity')).toBeInTheDocument();
    });
  });

  it('does not display inclusive opportunity section when disabled', async () => {
    const mockJob = createMockJob({
      id: 1,
      inclusiveOpportunity: false,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: createMockJob().title })).toBeInTheDocument();
    });

    expect(screen.queryByText('employerJobPostDetails.inclusiveOpportunity')).not.toBeInTheDocument();
  });

  it('displays remote location correctly', async () => {
    const mockJob = createMockJob({
      id: 1,
      remote: true,
      location: 'New York, NY',
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('employerJobPostDetails.remote (New York, NY)')).toBeInTheDocument();
    });
  });

  it('parses JSON contact information correctly', async () => {
    const mockJob = createMockJob({
      id: 1,
      contact: JSON.stringify({ name: 'HR Department', email: 'hr@techcorp.com' }),
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText(/HR Department: hr@techcorp.com/i)).toBeInTheDocument();
    });
  });

  it('parses plain string contact information correctly', async () => {
    const mockJob = createMockJob({
      id: 1,
      contact: 'jobs@company.com',
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('jobs@company.com')).toBeInTheDocument();
    });
  });

  it('displays applications list when applications exist', async () => {
    const mockJob = createMockJob({ id: 1 });
    const mockApplications = [
      createMockApplication({
        id: 1,
        applicantName: 'John Doe',
        jobPostId: 1,
        appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      }),
      createMockApplication({
        id: 2,
        applicantName: 'Jane Smith',
        jobPostId: 1,
        appliedDate: new Date().toISOString(), // today
      }),
    ];

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getAllByText('employerJobPostDetails.viewApplication')).toHaveLength(2);
  });

  it('displays empty state when no applications exist', async () => {
    const mockJob = createMockJob({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('employerJobPostDetails.noApplications')).toBeInTheDocument();
    });
  });

  it('formats application dates correctly - today', async () => {
    const mockJob = createMockJob({ id: 1 });
    const mockApplications = [
      createMockApplication({
        id: 1,
        jobPostId: 1,
        appliedDate: new Date().toISOString(),
      }),
    ];

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('employerJobPostDetails.applied.today')).toBeInTheDocument();
    });
  });

  it('formats application dates correctly - yesterday', async () => {
    const mockJob = createMockJob({ id: 1 });
    const mockApplications = [
      createMockApplication({
        id: 1,
        jobPostId: 1,
        appliedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      }),
    ];

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('employerJobPostDetails.applied.yesterday')).toBeInTheDocument();
    });
  });

  it('formats application dates correctly - days ago', async () => {
    const mockJob = createMockJob({ id: 1 });
    const mockApplications = [
      createMockApplication({
        id: 1,
        jobPostId: 1,
        appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    ];

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('employerJobPostDetails.applied.daysAgo')).toBeInTheDocument();
    });
  });

  it('navigates to edit page when Edit button is clicked', async () => {
    const user = setupUserEvent();
    const mockJob = createMockJob({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('employerJobPostDetails.editJobPost')).toBeInTheDocument();
    });

    const editButton = screen.getByText('employerJobPostDetails.editJobPost');
    await user.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/employer/jobs/1/edit');
  });

  it('navigates to application review page when View Application is clicked', async () => {
    const user = setupUserEvent();
    const mockJob = createMockJob({ id: 1 });
    const mockApplications = [
      createMockApplication({
        id: 123,
        applicantName: 'John Doe',
        jobPostId: 1,
      }),
    ];

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const viewButton = screen.getByText('employerJobPostDetails.viewApplication');
    await user.click(viewButton);

    expect(mockNavigate).toHaveBeenCalledWith('/employer/jobs/1/applications/123');
  });

  it('displays error message when job fetch fails', async () => {
    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('employerJobPostDetails.error.title')).toBeInTheDocument();
    });

    expect(screen.getByText('employerJobPostDetails.backToDashboard')).toBeInTheDocument();
  });

  it('handles applications fetch failure gracefully', async () => {
    const mockJob = createMockJob({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json({ message: 'Failed to fetch applications' }, { status: 500 });
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('employerJobPostDetails.error.title')).toBeInTheDocument();
    });
  });

  it('navigates back to dashboard when Back to Dashboard button is clicked', async () => {
    const user = setupUserEvent();

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('employerJobPostDetails.backToDashboard')).toBeInTheDocument();
    });

    const backButton = screen.getByText('employerJobPostDetails.backToDashboard');
    await user.click(backButton);

    // Link component navigation is handled by the router, not mockNavigate
    expect(backButton).toHaveAttribute('href', '/employer/dashboard');
  });

  it('displays breadcrumb navigation correctly', async () => {
    const mockJob = createMockJob({
      id: 1,
      title: 'Frontend Developer',
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Frontend Developer' })).toBeInTheDocument();
    });

    const breadcrumb = screen.getByLabelText('Breadcrumb');
    expect(breadcrumb).toBeInTheDocument();
  });

  it('generates correct avatar initials for applicant names', async () => {
    const mockJob = createMockJob({ id: 1 });
    const mockApplications = [
      createMockApplication({
        id: 1,
        applicantName: 'John Doe',
        jobPostId: 1,
      }),
      createMockApplication({
        id: 2,
        applicantName: 'Sarah Jane Smith',
        jobPostId: 1,
      }),
    ];

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    expect(screen.getByText('SJS')).toBeInTheDocument();
  });

  it('handles long job descriptions correctly', async () => {
    const longDescription = 'A'.repeat(5000);
    const mockJob = createMockJob({
      id: 1,
      description: longDescription,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });

  it('handles very long job titles correctly', async () => {
    const longTitle = 'Senior Principal Staff Lead Architect Engineer Manager Director';
    const mockJob = createMockJob({
      id: 1,
      title: longTitle,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: longTitle })).toBeInTheDocument();
    });
  });

  it('handles job with only minimum salary', async () => {
    const mockJob = createMockJob({
      id: 1,
      minSalary: 80000,
      maxSalary: 80000,
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('$80,000 - $80,000 per year')).toBeInTheDocument();
    });
  });

  it('handles multiple applications with different statuses', async () => {
    const mockJob = createMockJob({ id: 1 });
    const mockApplications = [
      createMockApplication({
        id: 1,
        applicantName: 'Pending Applicant',
        jobPostId: 1,
        status: 'PENDING',
      }),
      createMockApplication({
        id: 2,
        applicantName: 'Approved Applicant',
        jobPostId: 1,
        status: 'APPROVED',
      }),
      createMockApplication({
        id: 3,
        applicantName: 'Rejected Applicant',
        jobPostId: 1,
        status: 'REJECTED',
      }),
    ];

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('Pending Applicant')).toBeInTheDocument();
    });

    expect(screen.getByText('Approved Applicant')).toBeInTheDocument();
    expect(screen.getByText('Rejected Applicant')).toBeInTheDocument();
  });

  it('displays correct application count in section header', async () => {
    const mockJob = createMockJob({ id: 1 });
    const mockApplications = [
      createMockApplication({ id: 1, jobPostId: 1 }),
      createMockApplication({ id: 2, jobPostId: 1 }),
      createMockApplication({ id: 3, jobPostId: 1 }),
    ];

    server.use(
      http.get(`${API_BASE_URL}/jobs/1`, () => {
        return HttpResponse.json(mockJob);
      }),
      http.get(`${API_BASE_URL}/applications`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderWithProviders(<EmployerJobPostDetailsPage />, {
      initialEntries: ['/employer/jobs/1']
    });

    await waitFor(() => {
      expect(screen.getByText('employerJobPostDetails.applicationsReceived')).toBeInTheDocument();
    });
  });
});
