import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployerWorkplacesPage from '@/pages/EmployerWorkplacesPage';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as workplaceService from '@/services/workplace.service';
import userEvent from '@testing-library/user-event';
import type { EthicalTag } from '@/types/job';

vi.mock('react-i18next', async () => await import('@/test/__mocks__/react-i18next'));

// Mock create service
vi.mock('@/services/workplace.service', async () => {
  const actual = await vi.importActual('@/services/workplace.service');
  return {
    ...actual,
    createWorkplace: vi.fn(),
  };
});

// Mock MultiSelectDropdown to simplify testing
vi.mock('@/components/ui/multi-select-dropdown', () => ({
  MultiSelectDropdown: ({ onTagsChange }: { onTagsChange: (tags: EthicalTag[]) => void }) => (
    <button
      type="button"
      onClick={() => onTagsChange(['Sustainability' as EthicalTag])}
      aria-label="select-tags"
    >
      Select Tags
    </button>
  ),
}));

describe('CreateWorkplaceFlow Integration', () => {
  const renderPage = () => {
    return render(
      <BrowserRouter>
        <EmployerWorkplacesPage />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up the mock return value
    vi.mocked(workplaceService.createWorkplace).mockResolvedValue({
      id: 101,
      companyName: 'New Startup',
      sector: 'Technology',
      location: 'Remote',
      ethicalTags: ['Sustainability'],
      overallAvg: 0,
      ethicalAverages: {},
      employers: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    });
  });

  it('completes the create workplace flow', async () => {
    const user = userEvent.setup();
    renderPage();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // 1. Open New Workplace Modal
    const newButton = screen.getByRole('button', { name: 'employerWorkplaces.newWorkplace' });
    await user.click(newButton);

    // 2. Wait for the dialog to appear in the portal
    const dialog = await screen.findByRole('dialog', {}, { timeout: 3000 });
    expect(dialog).toBeInTheDocument();

    // 3. Find and click Create Workplace option
    const createOption = screen.getByText('employerWorkplaces.noWorkplaces.createWorkplace');
    await user.click(createOption);

    // 4. Wait for CreateWorkplaceModal to open (another dialog)
    // Wait for the new dialog to appear (there should be 2 dialogs now, or the first one closes)
    await waitFor(() => {
      const dialogs = screen.queryAllByRole('dialog');
      // Should have at least one dialog open
      expect(dialogs.length).toBeGreaterThan(0);
      // Check for the form inputs
      const companyNameLabel = screen.queryByLabelText(/^workplace\.createModal\.companyName/);
      expect(companyNameLabel).toBeTruthy();
    }, { timeout: 3000 });

    // 5. Fill out form - use fireEvent which works better with react-hook-form
    const companyNameInput = await screen.findByLabelText(/^workplace\.createModal\.companyName/, {}, { timeout: 2000 });
    const sectorInput = screen.getByLabelText(/^workplace\.createModal\.sector/);
    const locationInput = screen.getByLabelText(/^workplace\.createModal\.location/);

    // Use fireEvent.change which properly triggers react-hook-form handlers
    fireEvent.change(companyNameInput, { target: { value: 'New Startup' } });
    fireEvent.change(sectorInput, { target: { value: 'Technology' } });
    fireEvent.change(locationInput, { target: { value: 'Remote' } });

    // Select at least one ethical tag (required by schema) using the mocked component
    const tagButton = screen.getByRole('button', { name: 'select-tags' });
    fireEvent.click(tagButton);

    // Wait for form state to update
    await waitFor(() => {
      expect(companyNameInput).toHaveValue('New Startup');
      expect(sectorInput).toHaveValue('Technology');
      expect(locationInput).toHaveValue('Remote');
    });

    // 6. Find and submit the form - get the form element
    const form = companyNameInput.closest('form');
    expect(form).toBeTruthy();
    
    const submitButton = screen.getByRole('button', { name: 'workplace.createModal.submit' });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
    
    // Submit the form directly using fireEvent.submit
    fireEvent.submit(form!);

    // 7. Verify service call and success message
    await waitFor(() => {
      expect(workplaceService.createWorkplace).toHaveBeenCalled();
    }, { timeout: 5000 });

    expect(workplaceService.createWorkplace).toHaveBeenCalledWith(expect.objectContaining({
      companyName: 'New Startup',
      sector: 'Technology',
      location: 'Remote'
    }));

    await waitFor(() => {
      expect(screen.getByText('workplace.createModal.workplaceCreated')).toBeInTheDocument();
    });
  });
});
