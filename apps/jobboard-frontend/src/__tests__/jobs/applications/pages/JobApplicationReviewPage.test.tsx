import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders, setupUserEvent } from '@/__tests__/utils';
import { useAuthStore } from '@/modules/shared/stores/authStore';
import { createMockJWT, createMockApplication } from '@/__tests__/handlers';
import { server } from '@/__tests__/setup';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/__tests__/handlers';
import JobApplicationReviewPage from '../JobApplicationReviewPage';
import type { UpdateJobApplicationRequest } from '@/modules/shared/types/api.types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ jobId: '1', applicationId: '1' }),
  };
});

describe('JobApplicationReviewPage', () => {
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

  it('shows loading state while fetching application', () => {
    server.use(
      http.get(`${API_BASE_URL}/applications/1`, async () => {
        // Delay response to keep loading state visible
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json(createMockApplication({ id: 1 }));
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays application details correctly after successful fetch', async () => {
    const mockApplication = createMockApplication({
      id: 1,
      applicantName: 'John Doe',
      title: 'Software Engineer',
      company: 'Tech Corp',
      status: 'PENDING',
      coverLetter: 'I am very excited to apply for this position.',
      specialNeeds: 'Requires wheelchair accessibility',
      appliedDate: new Date().toISOString(),
    });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json({ url: 'https://example.com/cv.pdf' });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('I am very excited to apply for this position.')).toBeInTheDocument();
    expect(screen.getByText('Requires wheelchair accessibility')).toBeInTheDocument();
  });

  it('displays cover letter when present', async () => {
    const mockApplication = createMockApplication({
      id: 1,
      coverLetter: 'This is my cover letter. I have 5 years of experience.',
    });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('This is my cover letter. I have 5 years of experience.')).toBeInTheDocument();
    });

    expect(screen.getAllByText('applications.review.coverLetter')[0]).toBeInTheDocument();
  });

  it('does not display cover letter section when not present', async () => {
    const mockApplication = createMockApplication({
      id: 1,
      coverLetter: '',
    });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText(mockApplication.applicantName)).toBeInTheDocument();
    });

    expect(screen.queryByText('applications.review.coverLetter')).not.toBeInTheDocument();
  });

  it('displays special needs when present', async () => {
    const mockApplication = createMockApplication({
      id: 1,
      specialNeeds: 'Needs flexible work hours for medical appointments',
    });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('Needs flexible work hours for medical appointments')).toBeInTheDocument();
    });

    expect(screen.getByText('applications.review.specialNeeds')).toBeInTheDocument();
  });

  it('does not display special needs section when not present', async () => {
    const mockApplication = createMockApplication({
      id: 1,
      specialNeeds: '',
    });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText(mockApplication.applicantName)).toBeInTheDocument();
    });

    expect(screen.queryByText('applications.review.specialNeeds')).not.toBeInTheDocument();
  });

  it('displays CV download button when CV is available', async () => {
    const mockApplication = createMockApplication({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json('https://example.com/cv.pdf');
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'applications.review.download' })).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole('link', { name: 'applications.review.download' });
    expect(downloadButton).toHaveAttribute('href', 'https://example.com/cv.pdf');
    expect(downloadButton).toHaveAttribute('target', '_blank');
  });

  it('displays no CV message when CV is not available', async () => {
    const mockApplication = createMockApplication({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('applications.review.noCvAttached')).toBeInTheDocument();
    });
  });

  it('shows loading state for CV while fetching', async () => {
    const mockApplication = createMockApplication({ id: 1 });

    let resolveCV: (value: null) => void;
    const cvPromise = new Promise((resolve) => {
      resolveCV = resolve;
    });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, async () => {
        await cvPromise;
        return HttpResponse.json('https://example.com/cv.pdf');
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('applications.review.loadingCv')).toBeInTheDocument();
    });

    resolveCV!(null);
  });

  it('allows typing feedback in textarea', async () => {
    const mockApplication = createMockApplication({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText(mockApplication.applicantName)).toBeInTheDocument();
    });

    const feedbackTextarea = screen.getByRole('textbox', { name: /applications\.review\.feedback/i });

    fireEvent.change(feedbackTextarea, { target: { value: 'Great candidate with strong experience' } });

    expect(feedbackTextarea).toHaveValue('Great candidate with strong experience');
  });

  it('approves application successfully', async () => {
    const user = setupUserEvent();
    const mockApplication = createMockApplication({ id: 1, status: 'PENDING' });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      }),
      http.put(`${API_BASE_URL}/applications/1/approve`, async () => {
        return HttpResponse.json({ ...mockApplication, status: 'APPROVED' });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('applications.review.approve')).toBeInTheDocument();
    });

    const approveButton = screen.getByText('applications.review.approve');
    await user.click(approveButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/employer/jobs/1');
    });
  });

  it('approves application with feedback', async () => {
    const user = setupUserEvent();
    const mockApplication = createMockApplication({ id: 1, status: 'PENDING' });
    let capturedFeedback: string | undefined = '';

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      }),
      http.put(`${API_BASE_URL}/applications/1/approve`, async ({ request }) => {
        const body = await request.json() as UpdateJobApplicationRequest;
        capturedFeedback = body.feedback;
        return HttpResponse.json({ ...mockApplication, status: 'APPROVED', feedback: capturedFeedback });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('applications.review.approve')).toBeInTheDocument();
    });

    const feedbackTextarea = screen.getByPlaceholderText('applications.review.feedbackPlaceholder');
    await user.type(feedbackTextarea, 'Excellent qualifications');

    const approveButton = screen.getByText('applications.review.approve');
    await user.click(approveButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/employer/jobs/1');
    });
  });

  it('rejects application successfully', async () => {
    const user = setupUserEvent();
    const mockApplication = createMockApplication({ id: 1, status: 'PENDING' });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      }),
      http.put(`${API_BASE_URL}/applications/1/reject`, () => {
        return HttpResponse.json({ ...mockApplication, status: 'REJECTED' });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('applications.review.reject')).toBeInTheDocument();
    });

    const rejectButton = screen.getByText('applications.review.reject');
    await user.click(rejectButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/employer/jobs/1');
    });
  });

  it('rejects application with feedback', async () => {
    const user = setupUserEvent();
    const mockApplication = createMockApplication({ id: 1, status: 'PENDING' });
    let capturedFeedback: string | undefined = '';

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      }),
      http.put(`${API_BASE_URL}/applications/1/reject`, async ({ request }) => {
        const body = await request.json() as UpdateJobApplicationRequest;
        capturedFeedback = body.feedback;
        return HttpResponse.json({ ...mockApplication, status: 'REJECTED', feedback: capturedFeedback });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('applications.review.reject')).toBeInTheDocument();
    });

    const feedbackTextarea = screen.getByPlaceholderText('applications.review.feedbackPlaceholder');
    await user.type(feedbackTextarea, 'Not a good fit at this time');

    const rejectButton = screen.getByText('applications.review.reject');
    await user.click(rejectButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/employer/jobs/1');
    });
  });

  it('shows error toast on approval failure', async () => {
    const user = setupUserEvent();
    const mockApplication = createMockApplication({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      }),
      http.put(`${API_BASE_URL}/applications/1/approve`, () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('applications.review.approve')).toBeInTheDocument();
    });

    const approveButton = screen.getByText('applications.review.approve');
    await user.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });

    // Should not navigate on error
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows error toast on rejection failure', async () => {
    const user = setupUserEvent();
    const mockApplication = createMockApplication({ id: 1 });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      }),
      http.put(`${API_BASE_URL}/applications/1/reject`, () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('applications.review.reject')).toBeInTheDocument();
    });

    const rejectButton = screen.getByText('applications.review.reject');
    await user.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });

    // Should not navigate on error
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('displays error page when application fetch fails', async () => {
    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json({ message: 'Application not found' }, { status: 404 });
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('applications.review.error.title')).toBeInTheDocument();
    });

    expect(screen.getByText('applications.review.backToJob')).toBeInTheDocument();
  });

  it('navigates back to job when Back to Job button is clicked', async () => {
    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json({ message: 'Application not found' }, { status: 404 });
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('applications.review.backToJob')).toBeInTheDocument();
    });

    const backButton = screen.getByText('applications.review.backToJob');
    expect(backButton).toHaveAttribute('href', '/employer/jobs/1');
  });

  it('generates correct avatar initials for applicant name', async () => {
    const mockApplication = createMockApplication({
      id: 1,
      applicantName: 'Sarah Jane Smith',
    });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText('SJS')).toBeInTheDocument();
    });
  });

  it('displays application status correctly', async () => {
    const mockApplication = createMockApplication({
      id: 1,
      status: 'PENDING',
    });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText(/PENDING/i)).toBeInTheDocument();
    });
  });

  it('handles very long cover letters correctly', async () => {
    const longCoverLetter = 'A'.repeat(5000);
    const mockApplication = createMockApplication({
      id: 1,
      coverLetter: longCoverLetter,
    });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(screen.getByText(longCoverLetter)).toBeInTheDocument();
    });
  });

  it('preserves whitespace in cover letter and special needs', async () => {
    const multilineCoverLetter = 'Dear Hiring Manager,\n\nI am excited to apply.\n\nBest regards,\nJohn';
    const mockApplication = createMockApplication({
      id: 1,
      coverLetter: multilineCoverLetter,
      specialNeeds: 'Line 1\nLine 2\nLine 3',
    });

    server.use(
      http.get(`${API_BASE_URL}/applications/1`, () => {
        return HttpResponse.json(mockApplication);
      }),
      http.get(`${API_BASE_URL}/applications/1/cv`, () => {
        return HttpResponse.json(null, { status: 404 });
      })
    );

    renderWithProviders(<JobApplicationReviewPage />, {
      initialEntries: ['/employer/jobs/1/applications/1']
    });

    await waitFor(() => {
      expect(
        screen.getByText((_content, element) => element?.textContent === multilineCoverLetter)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText((_content, element) => element?.textContent === 'Line 1\nLine 2\nLine 3')
    ).toBeInTheDocument();
  });
});


