import { render, screen, fireEvent } from '@testing-library/react';
import { NewWorkplaceModal } from '@/modules/workplace/components/NewWorkplaceModal';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-i18next', async () => await import('@/__tests__/__mocks__/react-i18next'));

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
    expect(screen.getByText('workplace.newModal.title')).toBeInTheDocument();
    expect(screen.getByText('workplace.newModal.createWorkplace')).toBeInTheDocument();
    expect(screen.getByText('workplace.newModal.joinWorkplace')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderComponent({ open: false });
    expect(screen.queryByText('workplace.newModal.title')).not.toBeInTheDocument();
  });

  it('calls onCreateWorkplace when Create card is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('workplace.newModal.createWorkplace'));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(defaultProps.onCreateWorkplace).toHaveBeenCalled();
  });

  it('calls onJoinWorkplace when Join card is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('workplace.newModal.joinWorkplace'));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(defaultProps.onJoinWorkplace).toHaveBeenCalled();
  });
});
