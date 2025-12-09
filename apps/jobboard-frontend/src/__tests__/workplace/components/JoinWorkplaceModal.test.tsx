import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JoinWorkplaceModal } from '@/modules/workplace/components/JoinWorkplaceModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as workplaceService from '@modules/workplace/services/workplace.service';
import * as employerService from '@modules/employer/services/employer.service';
import type { PaginatedWorkplaceResponse, EmployerWorkplaceBrief } from '@shared/types/workplace.types';
import type { ReactNode } from 'react';

// Mock services
vi.mock('@modules/workplace/services/workplace.service', () => ({
  getWorkplaces: vi.fn(),
}));
const createEmployerRequestMock = vi.hoisted(() => vi.fn());

vi.mock('@modules/employer/services/employer.service', () => ({
  createEmployerRequest: createEmployerRequestMock,
  getMyWorkplaces: vi.fn(),
  useCreateEmployerRequestMutation: () => ({
    mutateAsync: (...args: unknown[]) => createEmployerRequestMock(...args),
    isPending: false,
  }),
  useMyWorkplacesQuery: () => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    error: null,
  }),
}));

// Simplify Radix dialog components to avoid portal/presence complexity in tests
vi.mock('@shared/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div data-testid="dialog-root">{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

// Mock slider to avoid Radix internals causing render loops in jsdom
vi.mock('@shared/components/ui/slider', () => ({
  Slider: ({
    value = [0],
    min = 0,
    max = 5,
    onValueChange,
  }: {
    value?: number[];
    min?: number;
    max?: number;
    onValueChange?: (v: number[]) => void;
  }) => (
    <input
      type="range"
      aria-label="Minimum rating"
      min={min}
      max={max}
      value={value[0] ?? 0}
      onChange={(e) => onValueChange?.([Number(e.target.value)])}
    />
  ),
}));

const mockWorkplaces = [
  {
    id: 1,
    companyName: 'Tech Corp',
    sector: 'Technology',
    location: 'San Francisco',
    overallAvg: 4.5,
  },
  {
    id: 2,
    companyName: 'Green Energy',
    sector: 'Energy',
    location: 'Austin',
    overallAvg: 4.8,
  },
];

describe('JoinWorkplaceModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  const renderComponent = (props = {}) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <JoinWorkplaceModal {...defaultProps} {...props} />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(workplaceService.getWorkplaces).mockResolvedValue({
      content: mockWorkplaces,
      totalPages: 1,
      totalElements: 2,
    } as PaginatedWorkplaceResponse);
    vi.mocked(employerService.getMyWorkplaces).mockResolvedValue([]);
  });

  it('renders search interface initially', async () => {
    renderComponent();
    
    expect(screen.getByText('workplace.joinModal.title')).toBeInTheDocument();
    expect(screen.getByText('workplace.joinModal.searchPlaceholder')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Green Energy')).toBeInTheDocument();
    });
  });

  it('searches for workplaces', async () => {
    renderComponent();
    
    const searchInput = screen.getByLabelText('workplace.joinModal.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'Tech' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(workplaceService.getWorkplaces).toHaveBeenCalledWith(expect.objectContaining({
        search: 'Tech',
      }));
    });
  });

  it('selects a workplace and shows request form', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Tech Corp'));

    await waitFor(() => {
      expect(screen.getByText('workplace.joinModal.requestTitle')).toBeInTheDocument();
      expect(screen.getByLabelText(/workplace\.joinModal\.noteLabel/i)).toBeInTheDocument();
    });
  });

  it('submits join request', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Tech Corp'));
    });

    const noteInput = screen.getByLabelText(/workplace\.joinModal\.noteLabel/i);
    fireEvent.change(noteInput, { target: { value: 'I want to join.' } });

    const submitButton = screen.getByRole('button', { name: /workplace\.joinModal\.submitRequest/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(employerService.createEmployerRequest).toHaveBeenCalledWith(1, {
        note: 'I want to join.',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('workplace.joinModal.requestSubmitted')).toBeInTheDocument();
    });
  });

  it('shows alert if already a member', async () => {
    vi.mocked(employerService.getMyWorkplaces).mockResolvedValue([
      { workplace: mockWorkplaces[0] } as EmployerWorkplaceBrief // Already member of Tech Corp
    ] as EmployerWorkplaceBrief[]);

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Tech Corp'));

    await waitFor(() => {
      expect(screen.getByText('workplace.joinModal.alreadyMember')).toBeInTheDocument();
    });
  });
});
