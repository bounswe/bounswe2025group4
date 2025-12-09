import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JobFilters } from '@modules/jobs/components/jobs/JobFilters';
import type { EthicalTag } from '@shared/types/job';

const setEthicalTags = vi.fn();
const setSalaryRange = vi.fn();
const setCompanyName = vi.fn();
const setIsRemote = vi.fn();
const setIsDisabilityInclusive = vi.fn();

const useFiltersMock = vi.fn(() => ({
  selectedEthicalTags: [],
  salaryRange: [40, 120] as [number, number],
  companyNameFilter: '',
  isRemoteOnly: false,
  isDisabilityInclusive: false,
  setEthicalTags,
  setSalaryRange,
  setCompanyName,
  setIsRemote,
  setIsDisabilityInclusive,
}));

vi.mock('@shared/hooks/useFilters', () => ({
  useFilters: (...args: unknown[]) => useFiltersMock(...args),
}));

vi.mock('@shared/components/ui/multi-select-dropdown', () => ({
  MultiSelectDropdown: ({
    selectedTags,
    onTagsChange,
  }: {
    selectedTags: EthicalTag[];
    onTagsChange: (tags: EthicalTag[]) => void;
  }) => (
    <button
      type="button"
      data-testid="mock-multi-select"
      onClick={() => onTagsChange([...(selectedTags ?? []), 'Remote-Friendly'])}
    >
      Select Tags
    </button>
  ),
}));

vi.mock('@shared/components/ui/slider', () => ({
  Slider: ({ onValueChange }: { onValueChange: (value: number[]) => void }) => (
    <button
      type="button"
      data-testid="salary-slider"
      onClick={() => onValueChange([60, 140])}
    >
      Adjust Salary
    </button>
  ),
}));

vi.mock('@shared/components/ui/checkbox', () => ({
  Checkbox: ({
    id,
    checked,
    onCheckedChange,
  }: {
    id?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      aria-checked={checked}
    />
  ),
}));

describe('JobFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFiltersMock.mockClear();
    useFiltersMock.mockReturnValue({
      selectedEthicalTags: [],
      salaryRange: [40, 120],
      companyNameFilter: '',
      isRemoteOnly: false,
      isDisabilityInclusive: false,
      setEthicalTags,
      setSalaryRange,
      setCompanyName,
      setIsRemote,
      setIsDisabilityInclusive,
    });
  });

  it('renders filter fields with current values', () => {
    useFiltersMock.mockReturnValue({
      selectedEthicalTags: ['Remote-Friendly'],
      salaryRange: [50, 150],
      companyNameFilter: 'Acme Corp',
      isRemoteOnly: true,
      isDisabilityInclusive: true,
      setEthicalTags,
      setSalaryRange,
      setCompanyName,
      setIsRemote,
      setIsDisabilityInclusive,
    });

    render(<JobFilters />);

    expect(screen.getByText('jobs.filters.ethicalTags')).toBeInTheDocument();
    expect(screen.getByLabelText('jobs.filters.companyName')).toHaveValue('Acme Corp');
    expect(screen.getByLabelText('jobs.filters.remoteOnly')).toBeChecked();
    expect(screen.getByLabelText('jobs.filters.disabilityInclusive')).toBeChecked();
  });

  it('updates ethical tags when selection changes', () => {
    render(<JobFilters />);

    fireEvent.click(screen.getByTestId('mock-multi-select'));

    expect(setEthicalTags).toHaveBeenCalledWith(['Remote-Friendly']);
  });

  it('updates salary range when slider value changes', () => {
    render(<JobFilters />);

    fireEvent.click(screen.getByTestId('salary-slider'));

    expect(setSalaryRange).toHaveBeenCalledWith([60, 140]);
  });

  it('updates checkbox filters and company name', () => {
    render(<JobFilters />);

    fireEvent.click(screen.getByLabelText('jobs.filters.remoteOnly'));
    fireEvent.click(screen.getByLabelText('jobs.filters.disabilityInclusive'));
    fireEvent.change(screen.getByLabelText('jobs.filters.companyName'), { target: { value: 'Beta' } });

    expect(setIsRemote).toHaveBeenCalledWith(true);
    expect(setIsDisabilityInclusive).toHaveBeenCalledWith(true);
    expect(setCompanyName).toHaveBeenCalledWith('Beta');
  });
});

