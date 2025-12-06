import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import JobsPage from '@modules/jobs/pages/JobsPage';
import { renderWithProviders } from '@/test/utils';
import { useAuthStore } from '@shared/stores/authStore';

const setJobSeeker = () => {
  useAuthStore.setState({
    user: { id: 1, username: 'jobseeker', email: 'job@seek.com', role: 'ROLE_JOBSEEKER' },
    accessToken: 'token',
    refreshToken: null,
    isAuthenticated: true,
  });
};

describe('JobsPage workplaces tab', () => {
  it('renders workplaces content when tab query is selected', async () => {
    renderWithProviders(<JobsPage />, { initialEntries: ['/jobs?tab=workplaces'] });
    setJobSeeker();

    expect(await screen.findByText('workplaces.title')).toBeInTheDocument();
  });
});

