import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateWorkplaceModal } from '@/components/workplace/CreateWorkplaceModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as workplaceService from '@/services/workplace.service';
import type { WorkplaceDetailResponse } from '@/types/workplace.types';
import type { EthicalTag } from '@/types/job';

vi.mock('react-i18next', async () => await import('@/test/__mocks__/react-i18next'));

// Mock the service
vi.mock('@/services/workplace.service', () => ({
  createWorkplace: vi.fn(),
}));

// Mock MultiSelectDropdown
vi.mock('@/components/ui/multi-select-dropdown', () => ({
  MultiSelectDropdown: ({ onTagsChange }: { selectedTags: EthicalTag[]; onTagsChange: (tags: EthicalTag[]) => void; placeholder?: string }) => (
    <button
      type="button"
      onClick={() => onTagsChange(['Salary Transparency' as EthicalTag])}
      aria-label="select-tags"
    >
      Select Tags
    </button>
  ),
}));

describe('CreateWorkplaceModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <CreateWorkplaceModal {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    renderComponent();
    expect(screen.getByLabelText(/^workplace\.createModal\.companyName/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^workplace\.createModal\.sector/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^workplace\.createModal\.location/)).toBeInTheDocument();
    expect(screen.getByText('workplace.createModal.website')).toBeInTheDocument();
    expect(screen.getByText('workplace.createModal.shortDescription')).toBeInTheDocument();
    expect(screen.getByText('workplace.createModal.detailedDescription')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: 'workplace.createModal.submit' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('workplace.createModal.errors.companyNameRequired')).toBeInTheDocument();
      expect(screen.getByText('workplace.createModal.errors.sectorRequired')).toBeInTheDocument();
      expect(screen.getByText('workplace.createModal.errors.locationRequired')).toBeInTheDocument();
      expect(screen.getByText('workplace.createModal.errors.ethicalTagsRequired')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockWorkplace: WorkplaceDetailResponse = {
      id: 1,
      companyName: 'Test Corp',
      sector: 'Technology',
      location: 'New York',
      ethicalTags: [],
      overallAvg: 0,
      ethicalAverages: {},
      employers: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };
    vi.mocked(workplaceService.createWorkplace).mockResolvedValue(mockWorkplace);

    renderComponent();

    fireEvent.change(screen.getByLabelText(/^workplace\.createModal\.companyName/), { target: { value: 'Test Corp' } });
    fireEvent.change(screen.getByLabelText(/^workplace\.createModal\.sector/), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText(/^workplace\.createModal\.location/), { target: { value: 'New York' } });

    // Select an ethical tag using the mock
    fireEvent.click(screen.getByRole('button', { name: 'select-tags' }));

    const submitButton = screen.getByRole('button', { name: 'workplace.createModal.submit' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(workplaceService.createWorkplace).toHaveBeenCalledWith(expect.objectContaining({
        companyName: 'Test Corp',
        sector: 'Technology',
        location: 'New York',
        ethicalTags: ['Salary Transparency']
      }));
    });

    await waitFor(() => {
      expect(screen.getByText('workplace.createModal.workplaceCreated')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    vi.mocked(workplaceService.createWorkplace).mockRejectedValue(new Error('API Error'));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/^workplace\.createModal\.companyName/), { target: { value: 'Test Corp' } });
    fireEvent.change(screen.getByLabelText(/^workplace\.createModal\.sector/), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText(/^workplace\.createModal\.location/), { target: { value: 'New York' } });

    // Select an ethical tag using the mock
    fireEvent.click(screen.getByRole('button', { name: 'select-tags' }));

    const submitButton = screen.getByRole('button', { name: 'workplace.createModal.submit' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
});
