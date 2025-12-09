import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import JobsPage from '@modules/jobs/pages/JobsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { I18nProvider } from '@shared/providers/I18nProvider';
import { AuthProvider } from '@/modules/auth/contexts/AuthContext';
import { setupUserEvent } from '@/__tests__/utils';
import { server } from '@/__tests__/setup';
import { API_BASE_URL, createMockJob } from '@/__tests__/handlers';
import { useAuthStore } from '@shared/stores/authStore';

vi.mock('@shared/components/common/CenteredLoader', () => ({
  default: () => <div data-testid="centered-loader">Loading...</div>,
}));

vi.mock('@modules/workplace/pages/WorkplacesPage', () => ({
  default: () => <div data-testid="workplaces-page">Workplaces Page</div>,
}));

vi.mock('@modules/jobs/applications/pages/MyApplicationsPage', () => ({
  default: () => <div data-testid="my-applications-page">My Applications</div>,
}));

vi.mock('@shared/hooks/useFilters', () => ({
  useFilters: () => ({
    selectedEthicalTags: [],
    selectedJobTypes: [],
    salaryRange: [10, 1000],
    companyNameFilter: '',
    isRemoteOnly: false,
    isDisabilityInclusive: false,
    setEthicalTags: vi.fn(),
    setJobTypes: vi.fn(),
    setSalaryRange: vi.fn(),
    setCompanyName: vi.fn(),
    setIsRemote: vi.fn(),
    setIsDisabilityInclusive: vi.fn(),
    resetFilters: vi.fn(),
  }),
}));

const renderJobsPage = (initialEntries = ['/jobs']) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      {
        path: '/jobs',
        element: <JobsPage />,
      },
    ],
    { initialEntries }
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};

describe('JobsPage integration', () => {
  beforeEach(() => {
    server.resetHandlers();
    useAuthStore.getState().clearSession();
  });

  it('renders jobs from the API', async () => {
    renderJobsPage(['/jobs']);

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    });
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
  });

  it('applies search queries to API requests and filters results', async () => {
    const jobs = [
      createMockJob({ id: 11, title: 'Data Scientist' }),
      createMockJob({ id: 22, title: 'Backend Engineer' }),
    ];
    let lastTitleParam: string | null = null;

    server.use(
      http.get(`${API_BASE_URL}/jobs`, async ({ request }) => {
        const url = new URL(request.url);
        lastTitleParam = url.searchParams.get('title');
        const term = lastTitleParam?.toLowerCase();
        const filtered = term ? jobs.filter((job) => job.title.toLowerCase().includes(term)) : jobs;
        return HttpResponse.json(filtered, { status: 200 });
      })
    );

    const user = setupUserEvent();
    renderJobsPage(['/jobs']);

    expect(await screen.findByText('Data Scientist')).toBeInTheDocument();

    const searchInput = screen.getByLabelText('jobs.searchAria');
    await user.clear(searchInput);
    await user.type(searchInput, 'Data{enter}');

    await waitFor(() => {
      expect(lastTitleParam).toBe('Data');
      expect(screen.getByText('Data Scientist')).toBeInTheDocument();
      expect(screen.queryByText('Backend Engineer')).not.toBeInTheDocument();
    });
  });

  it('shows an auth prompt when the jobs API responds with 401', async () => {
    server.use(
      http.get(`${API_BASE_URL}/jobs`, async () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      )
    );

    renderJobsPage(['/jobs']);

    expect(await screen.findByText('jobs.authRequired.title')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'jobs.authRequired.signUp' })).toHaveAttribute(
      'href',
      '/register'
    );
    expect(screen.getByRole('link', { name: 'jobs.authRequired.login' })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  it('prompts unauthenticated users to log in on the applications tab', async () => {
    const user = setupUserEvent();
    renderJobsPage(['/jobs']);

    await user.click(screen.getByRole('tab', { name: 'jobs.tabs.myApplications' }));

    expect(screen.getByText('jobs.myApplications.authTitle')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'layout.header.auth.login' })).toBeInTheDocument();
  });

  it('shows workplaces tab for non-employers and loads content when selected', async () => {
    const user = setupUserEvent();
    renderJobsPage(['/jobs']);

    await user.click(screen.getByRole('tab', { name: 'jobs.tabs.workplaces' }));

    expect(await screen.findByTestId('workplaces-page')).toBeInTheDocument();
  });

  it('hides workplaces tab for employer users', () => {
    useAuthStore.setState({
      user: { id: 99, username: 'employer', email: 'employer@example.com', role: 'ROLE_EMPLOYER' },
      accessToken: 'token',
      refreshToken: null,
      isAuthenticated: true,
    });

    renderJobsPage(['/jobs']);

    expect(screen.queryByRole('tab', { name: 'jobs.tabs.workplaces' })).not.toBeInTheDocument();
  });
});

