import { render, screen, fireEvent } from '@testing-library/react';
import { NewWorkplaceModal } from '@/components/workplace/NewWorkplaceModal';
import { describe, it, expect, vi } from 'vitest';

describe('NewWorkplaceModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onCreateWorkplace: vi.fn(),
    onJoinWorkplace: vi.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(<NewWorkplaceModal {...defaultProps} {...props} />);
  };

  it('renders correctly when open', () => {
    renderComponent();
    expect(screen.getByText('New Workplace')).toBeInTheDocument();
    expect(screen.getByText('Create Workplace')).toBeInTheDocument();
    expect(screen.getByText('Join Workplace')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderComponent({ open: false });
    expect(screen.queryByText('New Workplace')).not.toBeInTheDocument();
  });

  it('calls onCreateWorkplace when Create card is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Create Workplace'));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(defaultProps.onCreateWorkplace).toHaveBeenCalled();
  });

  it('calls onJoinWorkplace when Join card is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Join Workplace'));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(defaultProps.onJoinWorkplace).toHaveBeenCalled();
  });
});
