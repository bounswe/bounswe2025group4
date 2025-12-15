import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReportModal } from '@shared/components/report/ReportModal';
import userEvent from '@testing-library/user-event';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'report.messageLabel': 'Explain why you are reporting this',
        'report.messagePlaceholder': 'Please provide details...',
        'report.errorEmpty': 'Please enter a message explaining the report.',
        'report.errorFailed': 'Failed to submit report. Please try again.',
        'report.success': 'Thank you, your report has been submitted.',
        'report.type': 'Type',
        'report.author': 'Author',
        'report.reason': 'Reason',
        'report.reasons.fake': 'Fake',
        'report.reasons.spam': 'Spam',
        'report.reasons.offensive': 'Offensive',
        'report.reasons.other': 'Other',
        'report.submit': 'Submit Report',
        'report.submitting': 'Submitting...',
        'common.cancel': 'Cancel',
        'common.loading': 'Loading...',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

describe('ReportModal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: 'Report Item',
    onSubmit: vi.fn(),
  };

  it('renders correctly with required props', () => {
    render(<ReportModal {...defaultProps} />);
    expect(screen.getByText('Report Item')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit report/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders subtitle and context snippet when provided', () => {
    render(
      <ReportModal
        {...defaultProps}
        subtitle="Test Subtitle"
        contextSnippet="This is a snippet"
      />
    );
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText(/"This is a snippet"/)).toBeInTheDocument();
  });

  it('renders reportType and reportedName when provided', () => {
    render(
      <ReportModal
        {...defaultProps}
        reportType="Review"
        reportedName="John Doe"
      />
    );
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('validates empty message on submit', async () => {
    render(<ReportModal {...defaultProps} />);
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    
    // Initial state: button is disabled because message is empty (if we implemented that)
    // The component implementation disables the button if !message.trim()
    expect(submitButton).toBeDisabled();

    // If we want to test the error message, we might need to enable it first or check logic
    // But since it's disabled, we can't click it to trigger validation error unless we type spaces
    // Let's try typing spaces
    /*
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, '   ');
    expect(submitButton).toBeDisabled(); // Should still be disabled
    */
  });

  it('calls onSubmit with message when valid', async () => {
    const onSubmit = vi.fn();
    render(<ReportModal {...defaultProps} onSubmit={onSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'This is a report reason');
    
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    expect(submitButton).toBeEnabled();
    
    await userEvent.click(submitButton);
    
    expect(onSubmit).toHaveBeenCalledWith('This is a report reason', 'OTHER');
  });

  it('calls onSubmit with selected reason', async () => {
    const onSubmit = vi.fn();
    render(<ReportModal {...defaultProps} onSubmit={onSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Spam content');

    const select = screen.getByLabelText('Reason');
    await userEvent.selectOptions(select, 'SPAM');
    
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await userEvent.click(submitButton);
    
    expect(onSubmit).toHaveBeenCalledWith('Spam content', 'SPAM');
  });

  it('handles submission error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Failed'));
    render(<ReportModal {...defaultProps} onSubmit={onSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Reason');
    
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to submit report. Please try again.')).toBeInTheDocument();
    });
  });

  it('closes modal on cancel', async () => {
    const onClose = vi.fn();
    render(<ReportModal {...defaultProps} onClose={onClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);
    
    expect(onClose).toHaveBeenCalled();
  });
});
