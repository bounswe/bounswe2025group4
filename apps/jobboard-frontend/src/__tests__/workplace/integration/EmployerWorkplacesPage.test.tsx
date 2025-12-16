import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmployerWorkplacesPage from '@modules/workplace/pages/EmployerWorkplacesPage';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { server } from '@/__tests__/setup';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/__tests__/handlers';

interface NewWorkplaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkplace: () => void;
  onJoinWorkplace: () => void;
}

interface CreateWorkplaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface JoinWorkplaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

vi.mock('react-i18next', async () => await import('@/__tests__/__mocks__/react-i18next'));

// Mock child components to simplify integration test
vi.mock('@modules/workplace/components/workplace/NewWorkplaceModal', () => ({
  NewWorkplaceModal: ({ open, onOpenChange, onCreateWorkplace, onJoinWorkplace }: NewWorkplaceModalProps) => (
    open ? (
      <div role="dialog">
        workplace.newModal.title
        <button onClick={() => onOpenChange(false)}>common.cancel</button>
        <button onClick={onCreateWorkplace}>workplace.newModal.createWorkplace</button>
        <button onClick={onJoinWorkplace}>workplace.newModal.joinWorkplace</button>
      </div>
    ) : null
  )
}));

vi.mock('@modules/workplace/components/workplace/CreateWorkplaceModal', () => ({
  CreateWorkplaceModal: ({ open, onOpenChange }: CreateWorkplaceModalProps) => (
    open ? (
      <div role="dialog">
        workplace.createModal.title
        <button onClick={() => onOpenChange(false)}>common.cancel</button>
      </div>
    ) : null
  )
}));

vi.mock('@modules/workplace/components/workplace/JoinWorkplaceModal', () => ({
  JoinWorkplaceModal: ({ open, onOpenChange }: JoinWorkplaceModalProps) => (
    open ? (
      <div role="dialog">
        workplace.joinModal.title
        <button onClick={() => onOpenChange(false)}>common.cancel</button>
      </div>
    ) : null
  )
}));

describe('EmployerWorkplacesPage Integration', () => {
  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EmployerWorkplacesPage />
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
    
    expect(screen.getByText('employer.workplaces.title')).toBeInTheDocument();
    expect(screen.getByText('employer.workplaces.description')).toBeInTheDocument();
  });

  it('fetches and displays employer workplaces', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });

  it('opens new workplace modal', async () => {
    renderPage();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const newButton = screen.getByRole('button', { name: 'employer.workplaces.newWorkplace' });
    fireEvent.click(newButton);

    expect(screen.getByText('workplace.newModal.title')).toBeInTheDocument();
  });

  it('opens create workplace modal from selection', async () => {
    renderPage();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'employer.workplaces.newWorkplace' }));
    fireEvent.click(screen.getByText('workplace.newModal.createWorkplace'));

    expect(screen.getByText('workplace.createModal.title')).toBeInTheDocument();
  });

  it('opens join workplace modal from selection', async () => {
    renderPage();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'employer.workplaces.newWorkplace' }));
    fireEvent.click(screen.getByText('workplace.newModal.joinWorkplace'));

    expect(screen.getByText('workplace.joinModal.title')).toBeInTheDocument();
  });

  it('displays empty state when no workplaces', async () => {
    server.use(
      http.get(`${API_BASE_URL}/workplace/employers/me`, () => {
        return HttpResponse.json([], { status: 200 });
      })
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('employer.workplaces.empty.title')).toBeInTheDocument();
      expect(screen.getByText('employer.workplaces.empty.description')).toBeInTheDocument();
    });
  });
});

