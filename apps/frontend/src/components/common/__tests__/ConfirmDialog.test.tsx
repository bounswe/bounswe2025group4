import { render, screen } from '@testing-library/react';
import ConfirmDialog from '../ConfirmDialog';
import { describe, expect, beforeEach, vi, it } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('ConfirmDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    open: true,
    title: 'Test Title',
    content: 'Test Content',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<ConfirmDialog {...defaultProps} />);

    // Check if title and content are rendered correctly
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Check if default button texts are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('renders with custom button texts', () => {
    render(
      <ConfirmDialog 
        {...defaultProps}
        confirmText="Custom Confirm"
        cancelText="Custom Cancel"
      />
    );
    
    expect(screen.getByText('Custom Cancel')).toBeInTheDocument();
    expect(screen.getByText('Custom Confirm')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const confirmButton = screen.getByText('Confirm');
    await userEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);
    
    // Check if the confirm button shows processing text
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    
    // Check if buttons are disabled
    const confirmButton = screen.getByText('Processing...');
    const cancelButton = screen.getByText('Cancel');
    
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    
    // Check if circular progress is shown
    const circularProgress = document.querySelector('.MuiCircularProgress-root');
    expect(circularProgress).toBeInTheDocument();
  });
}); 