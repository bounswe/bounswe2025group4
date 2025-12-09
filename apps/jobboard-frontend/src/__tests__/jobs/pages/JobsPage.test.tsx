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

// Minimal auth store mock to avoid persist-related rehydration loops in tests
vi.mock('@shared/stores/authStore', () => {
  const state = {
    user: null as { id: number; username: string; email: string; role: string } | null,
    accessToken: null as string | null,
    refreshToken: null as string | null,
    isAuthenticated: false,
    login: (response: { id: number; username: string; email: string; role: string; token?: string }) => {
      state.user = {
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role,
      };
      state.accessToken = response.token ?? 'token';
      state.isAuthenticated = true;
    },
    logout: () => {
      state.clearSession();
    },
    restoreSession: () => {
      state.clearSession();
    },
    clearSession: () => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
  };

  const useAuthStore = (selector: (s: typeof state) => unknown = (s) => s) => selector(state);
  useAuthStore.getState = () => state;
  useAuthStore.setState = (partial: Partial<typeof state>) => {
    Object.assign(state, partial);
  };

  return { useAuthStore };
});

vi.mock('@shared/components/common/CenteredLoader', () => ({
  default: () => <div data-testid="centered-loader">Loading...</div>,
}));

vi.mock('@modules/workplace/pages/WorkplacesPage', () => ({
  default: () => <div data-testid="workplaces-page">Workplaces Page</div>,
}));

vi.mock('@modules/jobs/applications/pages/MyApplicationsPage', () => ({
  default: () => <div data-testid="my-applications-page">My Applications</div>,
}));

// Simplify the salary slider to avoid Radix internals causing recursive updates in tests
vi.mock('@shared/components/ui/slider', () => ({
  Slider: ({ 'aria-label': ariaLabel }: { 'aria-label'?: string }) => (
    <div role="slider" aria-label={ariaLabel} data-testid="mock-slider" />
  ),
}));

vi.mock('@shared/hooks/useFilters', () => ({
  useFilters: () => ({
    selectedEthicalTags: [],
    selectedJobTypes: [],
    // Keep the mocked range within the slider's min/max to avoid Radix slider loops
    salaryRange: [40, 120],
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

