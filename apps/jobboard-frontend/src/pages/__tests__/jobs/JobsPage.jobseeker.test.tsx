import { screen } from '@testing-library/react';
import JobsPage from '@/pages/JobsPage';
import { renderWithProviders } from '@/test/utils';

describe('JobsPage (job seeker view)', () => {
  it('shows job results for unauthenticated users', async () => {
    renderWithProviders(<JobsPage />, { initialEntries: ['/jobs'] });

    // mock handler returns two jobs; ensure they appear
    expect(await screen.findByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument();

    // result summary uses mocked translation
    expect(screen.getByText('2 jobs found')).toBeInTheDocument();
    expect(
      screen.getByText('2 opportunities match your current filters.'),
    ).toBeInTheDocument();
  });
});
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import JobsPage from '@/pages/JobsPage';
import { renderWithProviders, setupUserEvent } from '@/test/utils';
import { server } from '@/test/setup';
import { API_BASE_URL } from '@/test/handlers';

describe('JobsPage (job seeker view)', () => {
  it('renders job cards after loading', async () => {
    renderWithProviders(<JobsPage />, { initialEntries: ['/jobs'] });

    expect(await screen.findByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('3 jobs found')).toBeInTheDocument();
    expect(screen.getByText('3 opportunities match your current filters.')).toBeInTheDocument();
  });

  it('filters jobs by search term', async () => {
    const user = setupUserEvent();
    renderWithProviders(<JobsPage />, { initialEntries: ['/jobs?search='] });

    const searchInput = screen.getByLabelText('Search jobs');
    await user.clear(searchInput);
    await user.type(searchInput, 'Backend{enter}');

    await waitFor(() => {
      expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
    });
    expect(screen.queryByText('Frontend Developer')).not.toBeInTheDocument();
    expect(screen.getByText('1 job found')).toBeInTheDocument();
  });

  it('clears search and restores full results', async () => {
    const user = setupUserEvent();
    renderWithProviders(<JobsPage />, { initialEntries: ['/jobs'] });

    const searchInput = await screen.findByLabelText('Search jobs');
    await user.type(searchInput, 'Backend{enter}');

    await waitFor(() => {
      expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
    });
    expect(screen.getByText('1 job found')).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clearButton);

    expect(await screen.findByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('3 jobs found')).toBeInTheDocument();
  });

  it('shows account required banner when the API returns 401', async () => {
    server.use(
      http.get(`${API_BASE_URL}/jobs`, () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );

    renderWithProviders(<JobsPage />, { initialEntries: ['/jobs'] });

    expect(await screen.findByText('Account required')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument();
  });

  it('displays empty state when no jobs match filters', async () => {
    server.use(
      http.get(`${API_BASE_URL}/jobs`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('title')) {
          return HttpResponse.json([], { status: 200 });
        }
        return HttpResponse.json([], { status: 200 });
      }),
    );

    const user = setupUserEvent();
    renderWithProviders(<JobsPage />, { initialEntries: ['/jobs'] });

    const searchInput = screen.getByLabelText('Search jobs');
    await user.clear(searchInput);
    await user.type(searchInput, 'DevOps{enter}');

    expect(await screen.findByText('No jobs found matching your criteria.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset filters' })).toBeInTheDocument();
  });
});

