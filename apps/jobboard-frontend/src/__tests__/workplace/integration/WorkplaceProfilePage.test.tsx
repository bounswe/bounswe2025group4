import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkplaceProfilePage from '@modules/workplace/pages/WorkplaceProfilePage';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/test/handlers';
import { AuthProvider } from '@/modules/auth/contexts/AuthContext';

vi.mock('react-i18next', async () => await import('@/test/__mocks__/react-i18next'));

// Mock jobs service to avoid errors
vi.mock('@modules/jobs/services/jobs.service', () => ({
  getJobsByEmployer: vi.fn().mockResolvedValue([]),
}));

describe('WorkplaceProfilePage Integration', () => {
  const renderPage = (id = '1') => {
    return render(
      <AuthProvider>
        <MemoryRouter initialEntries={[`/workplace/${id}`]}>
          <Routes>
            <Route path="/workplace/:id" element={<WorkplaceProfilePage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
  };

  it('renders workplace details', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.queryByText('common.loading')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Leading tech innovation')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });

  it('displays ethical tags', async () => {
    renderPage();

    await waitFor(() => {
      // Use getAllByText since tags appear multiple times
      const sustainabilityElements = screen.getAllByText('Sustainability');
      expect(sustainabilityElements.length).toBeGreaterThan(0);
      const diversityElements = screen.getAllByText('Diversity');
      expect(diversityElements.length).toBeGreaterThan(0);
    });
  });

  it('displays reviews section', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('reviews.workplaceReviews')).toBeInTheDocument();
    });

    // Check for review stats
    expect(screen.getByText('4.5')).toBeInTheDocument(); // Overall rating
  });

  it('handles not found state', async () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Override handler to return 404 for specific workplace ID
    server.use(
      http.get(`${API_BASE_URL}/workplace/999`, () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    renderPage('999');

    await waitFor(() => {
      expect(screen.getByText('workplace.profile.notFound')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    consoleErrorSpy.mockRestore();
  });

  it('displays employers list', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('workplace.profile.employers')).toBeInTheDocument();
      expect(screen.getByText('employer1')).toBeInTheDocument();
    });
  });

  it('renders helpful initial state from API', async () => {
    const pagedReviews = {
      content: [
        {
          id: 201,
          workplaceId: 1,
          userId: 5,
          username: 'user5',
          title: 'Helpful toggle test',
          content: 'Toggle me',
          anonymous: false,
          helpfulCount: 1,
          helpfulByUser: false,
          overallRating: 4,
          ethicalPolicyRatings: {},
          createdAt: '2024-01-10',
          updatedAt: '2024-01-10',
        },
        {
          id: 202,
          workplaceId: 1,
          userId: 6,
          username: 'user6',
          title: 'Already voted',
          content: 'I voted before',
          anonymous: false,
          helpfulCount: 5,
          helpfulByUser: true,
          overallRating: 5,
          ethicalPolicyRatings: {},
          createdAt: '2024-01-09',
          updatedAt: '2024-01-09',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };

    server.use(
      http.get(`${API_BASE_URL}/workplace/:id/review`, async () => HttpResponse.json(pagedReviews)),
      http.post(`${API_BASE_URL}/workplace/:workplaceId/review/:reviewId/helpful`, async () =>
        HttpResponse.json({
          ...pagedReviews.content[0],
          helpfulCount: 2,
          helpfulByUser: true,
        }),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Helpful toggle test')).toBeInTheDocument();
      expect(screen.getByText('Already voted')).toBeInTheDocument();
    });

    // Initial counts reflect server data
    expect(
      screen.getByRole('button', { name: /reviews.helpful \(1\)/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reviews.helpful \(5\)/i }),
    ).toBeInTheDocument();
  });

  it('toggles helpful on and off in the page', async () => {
    const review = {
      id: 301,
      workplaceId: 1,
      userId: 7,
      username: 'user7',
      title: 'Toggle roundtrip',
      content: 'Click twice',
      anonymous: false,
      helpfulCount: 1,
      helpfulByUser: false,
      overallRating: 4,
      ethicalPolicyRatings: {},
      createdAt: '2024-02-01',
      updatedAt: '2024-02-01',
    };

    server.use(
      http.get(`${API_BASE_URL}/workplace/:id/review`, async () =>
        HttpResponse.json({
          content: [review],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        }),
      ),
    );

    let toggled = false;
    server.use(
      http.post(`${API_BASE_URL}/workplace/:workplaceId/review/:reviewId/helpful`, async () => {
        toggled = !toggled;
        return HttpResponse.json({
          ...review,
          helpfulCount: toggled ? 2 : 1,
          helpfulByUser: toggled,
        });
      }),
    );

    renderPage();
    const user = userEvent.setup();

    const button = await screen.findByRole('button', { name: /reviews.helpful \(1\)/i });

    await user.click(button);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /reviews.helpful \(2\)/i })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: /reviews.helpful \(2\)/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /reviews.helpful \(1\)/i })).toBeInTheDocument(),
    );
  });

  it('rolls back helpful count on error', async () => {
    const review = {
      id: 401,
      workplaceId: 1,
      userId: 8,
      username: 'user8',
      title: 'Toggle error',
      content: 'Should rollback',
      anonymous: false,
      helpfulCount: 3,
      helpfulByUser: false,
      overallRating: 4,
      ethicalPolicyRatings: {},
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01',
    };

    server.use(
      http.get(`${API_BASE_URL}/workplace/:id/review`, async () =>
        HttpResponse.json({
          content: [review],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        }),
      ),
      http.post(`${API_BASE_URL}/workplace/:workplaceId/review/:reviewId/helpful`, async () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    renderPage();
    const user = userEvent.setup();

    const button = await screen.findByRole('button', { name: /reviews.helpful \(3\)/i });
    await user.click(button);

    // Optimistic update will change text briefly; final state should roll back to original count
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /reviews.helpful \(3\)/i })).toBeInTheDocument(),
    );
  });
});
