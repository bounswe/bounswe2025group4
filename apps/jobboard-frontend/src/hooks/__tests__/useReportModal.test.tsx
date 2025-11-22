import { renderHook, act, screen, render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useReportModal } from '../useReportModal';

// Mock ReportModal component
vi.mock('@/components/report/ReportModal', () => ({
  ReportModal: ({ open, title, subtitle, contextSnippet }: any) => (
    open ? (
      <div data-testid="mock-report-modal">
        <h1>{title}</h1>
        {subtitle && <h2>{subtitle}</h2>}
        {contextSnippet && <p>{contextSnippet}</p>}
      </div>
    ) : null
  ),
}));

describe('useReportModal', () => {
  it('should initialize with closed modal', () => {
    const { result } = renderHook(() => useReportModal());
    expect(result.current.ReportModalElement).toBeNull();
  });

  it('should open modal with correct config', () => {
    const { result } = renderHook(() => useReportModal());
    
    act(() => {
      result.current.openReport({
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        onSubmit: vi.fn(),
      });
    });

    // We need to render the element to check if it's visible
    // But since it's a React Element returned by hook, we can check if it's not null
    expect(result.current.ReportModalElement).not.toBeNull();
    
    // To verify props, we can render the element
    render(result.current.ReportModalElement!);
    expect(screen.getByTestId('mock-report-modal')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should close modal', () => {
    const { result } = renderHook(() => useReportModal());
    
    act(() => {
      result.current.openReport({
        title: 'Test Title',
        onSubmit: vi.fn(),
      });
    });

    expect(result.current.ReportModalElement).not.toBeNull();

    act(() => {
      result.current.closeReport();
    });

    // Re-render to reflect state change
    // Note: renderHook handles state updates, but the returned element might need a re-render of the hook?
    // Actually, result.current is a proxy that gets updated.
    // However, the Element itself is created during render.
    // Let's check if it becomes null (it might not if we just check the property, but the hook re-runs)
    
    // Wait, the hook returns { ReportModalElement } which is computed in the hook body.
    // If state 'open' changes to false, ReportModalElement should be null (or render closed modal if we passed open prop, but we conditionally render it).
    // In my implementation: const ReportModalElement = modalConfig ? ... : null;
    // But I pass `open={open}` to ReportModal.
    // Ah, I changed implementation to:
    /*
      const ReportModalElement = modalConfig ? (
        <ReportModal open={open} ... />
      ) : null;
    */
    // So if modalConfig is set, it returns the element, but with open={false} if closed?
    // No, closeReport sets open to false.
    // If open is false, ReportModal is still rendered but with open={false}.
    // Wait, let's check my implementation of useReportModal.
    
    /*
      const ReportModalElement = modalConfig ? (
        <ReportModal
          open={open}
          ...
        />
      ) : null;
    */
    
    // So if I call closeReport, open becomes false. modalConfig is still there.
    // So ReportModalElement is NOT null. It is a React Element with open={false}.
    // My mock renders null if open is false.
    
    // So:
    render(result.current.ReportModalElement!);
    expect(screen.queryByTestId('mock-report-modal')).not.toBeInTheDocument();
  });
});
