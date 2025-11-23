import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployerWorkplacesPage from '@/pages/EmployerWorkplacesPage';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/test/handlers';

// Mock child components to simplify integration test
vi.mock('@/components/workplace/NewWorkplaceModal', () => ({
  NewWorkplaceModal: ({ open, onOpenChange, onCreateWorkplace, onJoinWorkplace }: any) => (
    open ? (
      <div role="dialog">
        New Workplace Modal
        <button onClick={() => onOpenChange(false)}>Close</button>
        <button onClick={onCreateWorkplace}>Create</button>
        <button onClick={onJoinWorkplace}>Join</button>
      </div>
    ) : null
  )
}));

vi.mock('@/components/workplace/CreateWorkplaceModal', () => ({
  CreateWorkplaceModal: ({ open, onOpenChange }: any) => (
    open ? (
      <div role="dialog">
        Create Workplace Form
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null
  )
}));

vi.mock('@/components/workplace/JoinWorkplaceModal', () => ({
  JoinWorkplaceModal: ({ open, onOpenChange }: any) => (
    open ? (
      <div role="dialog">
        Join Workplace Form
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null
  )
}));

describe('EmployerWorkplacesPage Integration', () => {
  const renderPage = () => {
    return render(
      <BrowserRouter>
        <EmployerWorkplacesPage />
      </BrowserRouter>
    );
  };

  it('renders page title and description', async () => {
    renderPage();
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('My Workplaces')).toBeInTheDocument();
    expect(screen.getByText(/Manage your workplaces/i)).toBeInTheDocument();
  });

  it('fetches and displays employer workplaces', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('opens new workplace modal', async () => {
    renderPage();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const newButton = screen.getByRole('button', { name: /New Workplace/i });
    fireEvent.click(newButton);

    expect(screen.getByText('New Workplace Modal')).toBeInTheDocument();
  });

  it('opens create workplace modal from selection', async () => {
    renderPage();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /New Workplace/i }));
    fireEvent.click(screen.getByText('Create'));

    expect(screen.getByText('Create Workplace Form')).toBeInTheDocument();
  });

  it('opens join workplace modal from selection', async () => {
    renderPage();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /New Workplace/i }));
    fireEvent.click(screen.getByText('Join'));

    expect(screen.getByText('Join Workplace Form')).toBeInTheDocument();
  });

  it('displays empty state when no workplaces', async () => {
    server.use(
      http.get(`${API_BASE_URL}/workplace/employers/me`, () => {
        return HttpResponse.json([], { status: 200 });
      })
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/No Workplaces Yet/i)).toBeInTheDocument();
      expect(screen.getByText(/Create your first workplace or request to join an existing one/i)).toBeInTheDocument();
    });
  });
});
