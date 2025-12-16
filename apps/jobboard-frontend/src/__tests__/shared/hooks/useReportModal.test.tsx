import { renderHook, act, screen, render } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { useReportModal } from '@shared/hooks/useReportModal';
import type { ReportModalProps } from '@shared/components/report/ReportModal';

// Mock ReportModal component
vi.mock('@shared/components/report/ReportModal', () => ({
  ReportModal: ({ open, title, subtitle, contextSnippet }: ReportModalProps) =>
    open ? (
      <div data-testid="mock-report-modal">
        <h1>{title}</h1>
        {subtitle && <h2>{subtitle}</h2>}
        {contextSnippet && <p>{contextSnippet}</p>}
      </div>
    ) : null,
}));

describe('useReportModal', () => {
  beforeAll(() => {
    // Ensure requestAnimationFrame exists in the test environment
    if (!globalThis.requestAnimationFrame) {
      vi.stubGlobal('requestAnimationFrame', (cb: (time: number) => void) => {
        cb(performance.now());
        return 0;
      });
    }
  });

  it('keeps the modal mounted but closed by default', () => {
    const { result } = renderHook(() => useReportModal());
    const { rerender } = render(result.current.ReportModalElement);

    expect(screen.queryByTestId('mock-report-modal')).toBeNull();

    act(() => {
      result.current.openReport({
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        contextSnippet: 'context',
        onSubmit: vi.fn(),
      });
    });

    rerender(result.current.ReportModalElement);
    expect(screen.getByTestId('mock-report-modal')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText('context')).toBeInTheDocument();
  });

  it('closes the modal without unmounting', () => {
    const { result } = renderHook(() => useReportModal());
    const { rerender } = render(result.current.ReportModalElement);

    act(() => {
      result.current.openReport({
        title: 'Close Test',
        onSubmit: vi.fn(),
      });
    });
    rerender(result.current.ReportModalElement);
    expect(screen.getByTestId('mock-report-modal')).toBeInTheDocument();

    act(() => {
      result.current.closeReport();
    });
    rerender(result.current.ReportModalElement);
    expect(screen.queryByTestId('mock-report-modal')).toBeNull();
  });
});
