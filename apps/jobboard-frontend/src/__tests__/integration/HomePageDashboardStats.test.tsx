import { screen, within } from '@testing-library/react';
import HomePage from '@modules/home/pages/HomePage';
import { renderWithProviders } from '../utils';

describe('HomePage community dashboard stats', () => {
  it('renders forum statistics from dashboard endpoint', async () => {
    renderWithProviders(<HomePage />);

    const forumTitle = await screen.findByText('home.stats.forum.title');
    const forumCard = forumTitle.closest('[data-slot="card"]');
    expect(forumCard).not.toBeNull();

    const forum = within(forumCard as HTMLElement);
    expect(forum.getByText('10')).toBeInTheDocument();
    expect(forum.getByText('home.stats.forum.comments')).toBeInTheDocument();
    expect(forum.getByText('25')).toBeInTheDocument();
    expect(forum.getByText('home.stats.forum.newThisWeek')).toBeInTheDocument();
    expect(forum.getByText('+3')).toBeInTheDocument();
  });
});

