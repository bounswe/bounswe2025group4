import { render, screen, fireEvent } from '@testing-library/react';
import EmptyJobsState from '../EmptyJobsState';
import { describe, expect, vi, it } from 'vitest';

describe('EmptyJobsState', () => {
  it('renders the empty state message', () => {
    render(<EmptyJobsState />);

    expect(screen.getByText('No Jobs Found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your filters or broadening your search.')
    ).toBeInTheDocument();
  });

  it('does not render clear filters button when onClearFilters is not provided', () => {
    render(<EmptyJobsState />);

    expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
  });

  it('renders clear filters button when onClearFilters is provided', () => {
    render(<EmptyJobsState onClearFilters={() => {}} />);

    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('calls onClearFilters when clear filters button is clicked', () => {
    const mockOnClearFilters = vi.fn();
    render(<EmptyJobsState onClearFilters={mockOnClearFilters} />);

    const clearFiltersButton = screen.getByText('Clear Filters');
    fireEvent.click(clearFiltersButton);

    expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
  });
});
