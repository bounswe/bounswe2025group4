import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { server } from '@/__tests__/setup';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/__tests__/handlers';

vi.mock('@/modules/auth/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));

import WorkplacesPage from '@modules/workplace/pages/WorkplacesPage';

describe('WorkplacesPage Integration', () => {
  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WorkplacesPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders page title and description', async () => {
    renderPage();
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('workplaces.title')).toBeInTheDocument();
    expect(screen.getByText('workplaces.description')).toBeInTheDocument();
  });

  it('fetches and displays workplaces', async () => {
    renderPage();

    // Wait for workplaces to render
    expect(await screen.findByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Green Energy Inc')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    renderPage();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('workplaces.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'Tech' } });
    
    await waitFor(() => {
      expect(screen.getByText('common.search')).toBeInTheDocument();
    });

    const searchButton = screen.getByText('common.search').parentElement;
    if (searchButton) {
      fireEvent.click(searchButton);
    }

    await waitFor(() => {
      // Should show filtered results
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      // Should NOT show other results (assuming mock handler filters correctly or we mock it here)
      // Note: The default handler in workplace-handlers.ts implements filtering logic
      expect(screen.queryByText('Green Energy Inc')).not.toBeInTheDocument();
    });
  });

  it('handles filter toggling', async () => {
    renderPage();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const filterButton = screen.getByText('workplaces.filters.title');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByLabelText('workplaces.filters.sector')).toBeInTheDocument();
      expect(screen.getByLabelText('workplaces.filters.location')).toBeInTheDocument();
      expect(screen.getByLabelText('workplaces.filters.sortBy')).toBeInTheDocument();
    });
  });

  it('displays empty state when no results found', async () => {
    // Override handler to return empty list
    server.use(
      http.get(`${API_BASE_URL}/workplace`, () => {
        return HttpResponse.json({
          content: [],
          totalPages: 0,
          totalElements: 0,
          page: 0,
          size: 12
        });
      })
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('workplaces.empty.title')).toBeInTheDocument();
      expect(screen.getByText('workplaces.empty.noWorkplaces')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Override handler to return error
    server.use(
      http.get(`${API_BASE_URL}/workplace`, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderPage();

    expect(await screen.findAllByText(/Something went wrong/i)).toBeTruthy();
    
    const retryButton = screen.getByRole('button', { name: /Try Again/i });
    expect(retryButton).toBeInTheDocument();
  });
});
