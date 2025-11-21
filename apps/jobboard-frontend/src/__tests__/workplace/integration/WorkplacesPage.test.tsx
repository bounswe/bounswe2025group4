import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WorkplacesPage from '@/pages/WorkplacesPage';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/test/handlers';

describe('WorkplacesPage Integration', () => {
  const renderPage = () => {
    return render(
      <BrowserRouter>
        <WorkplacesPage />
      </BrowserRouter>
    );
  };

  it('renders page title and description', async () => {
    renderPage();
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Workplaces')).toBeInTheDocument();
    expect(
      screen.getByText(/discover companies to learn more about their culture and ratings/i)
    ).toBeInTheDocument();
  });

  it('fetches and displays workplaces', async () => {
    renderPage();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Check if mock workplaces are displayed
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Green Energy Inc')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    renderPage();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/company name/i);
    fireEvent.change(searchInput, { target: { value: 'Tech' } });
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

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

    const filterButton = screen.getByText(/Filters/i);
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Sector/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Sort By/i)).toBeInTheDocument();
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
      expect(screen.getByText(/No Workplaces Found/i)).toBeInTheDocument();
      expect(screen.getByText(/There are no workplaces available at the moment/i)).toBeInTheDocument();
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

    await waitFor(() => {
      expect(screen.getByText(/Failed to load workplaces/i)).toBeInTheDocument();
    });
    
    const retryButton = screen.getByRole('button', { name: /Try Again/i });
    expect(retryButton).toBeInTheDocument();
  });
});
