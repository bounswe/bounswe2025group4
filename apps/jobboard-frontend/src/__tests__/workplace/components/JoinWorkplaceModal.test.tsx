import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JoinWorkplaceModal } from '@/components/workplace/JoinWorkplaceModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as workplaceService from '@/services/workplace.service';
import * as employerService from '@/services/employer.service';
import type { PaginatedWorkplaceResponse, EmployerWorkplaceBrief } from '@/types/workplace.types';

// Mock services
vi.mock('@/services/workplace.service', () => ({
  getWorkplaces: vi.fn(),
}));
vi.mock('@/services/employer.service', () => ({
  createEmployerRequest: vi.fn(),
  getMyWorkplaces: vi.fn(),
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
    return render(
      <BrowserRouter>
        <JoinWorkplaceModal {...defaultProps} {...props} />
      </BrowserRouter>
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
