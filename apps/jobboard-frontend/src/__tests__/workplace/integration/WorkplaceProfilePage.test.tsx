import { render, screen, waitFor } from '@testing-library/react';
import WorkplaceProfilePage from '@/pages/WorkplaceProfilePage';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/test/handlers';
import { AuthProvider } from '@/contexts/AuthContext';

vi.mock('react-i18next', async () => await import('@/test/__mocks__/react-i18next'));

// Mock jobs service to avoid errors
vi.mock('@/services/jobs.service', () => ({
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
    // Override handler to return 404
    server.use(
      http.get(`${API_BASE_URL}/workplace/:id`, () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    renderPage('999');

    await waitFor(() => {
      expect(screen.getByText('workplace.profile.notFound')).toBeInTheDocument();
    });
  });

  it('displays employers list', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('workplace.profile.employers')).toBeInTheDocument();
      expect(screen.getByText('employer1')).toBeInTheDocument();
    });
  });
});
