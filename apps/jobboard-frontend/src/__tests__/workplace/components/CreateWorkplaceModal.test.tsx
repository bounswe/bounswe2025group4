import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateWorkplaceModal } from '@/components/workplace/CreateWorkplaceModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as workplaceService from '@/services/workplace.service';

// Mock the service
vi.mock('@/services/workplace.service', () => ({
  createWorkplace: vi.fn(),
}));

// Mock MultiSelectDropdown
vi.mock('@/components/ui/multi-select-dropdown', () => ({
  MultiSelectDropdown: ({ onTagsChange }: any) => (
    <button 
      type="button"
      onClick={() => onTagsChange(['Salary Transparency'])}
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
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sector/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Short Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Detailed Description/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /Create Workplace/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Company name is required')).toBeInTheDocument();
      expect(screen.getByText('Sector is required')).toBeInTheDocument();
      expect(screen.getByText('Location is required')).toBeInTheDocument();
      expect(screen.getByText('At least one ethical tag is required')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockWorkplace = { id: 1, companyName: 'Test Corp' };
    (workplaceService.createWorkplace as any).mockResolvedValue(mockWorkplace);

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Company Name/i), { target: { value: 'Test Corp' } });
    fireEvent.change(screen.getByLabelText(/Sector/i), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'New York' } });
    
    // Select an ethical tag using the mock
    fireEvent.click(screen.getByRole('button', { name: 'select-tags' }));

    const submitButton = screen.getByRole('button', { name: /Create Workplace/i });
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
      expect(screen.getByText('Workplace Created!')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    (workplaceService.createWorkplace as any).mockRejectedValue(new Error('API Error'));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Company Name/i), { target: { value: 'Test Corp' } });
    fireEvent.change(screen.getByLabelText(/Sector/i), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'New York' } });
    
    // Select an ethical tag using the mock
    fireEvent.click(screen.getByRole('button', { name: 'select-tags' }));

    const submitButton = screen.getByRole('button', { name: /Create Workplace/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
});
