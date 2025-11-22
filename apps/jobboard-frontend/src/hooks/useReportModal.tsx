import { startTransition, useCallback, useMemo, useState } from 'react';
import { ReportModal, type ReportReasonType } from '@/components/report/ReportModal';

interface OpenReportParams {
  title: string;
  subtitle?: string;
  contextSnippet?: string;
  reportType?: string;
  reportedName?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  initialMessage?: string;
  onSubmit: (message: string, reason: ReportReasonType) => Promise<void> | void;
}

const DEFAULT_MODAL_CONFIG: OpenReportParams = {
  title: '',
  subtitle: '',
  contextSnippet: '',
  reportType: '',
  reportedName: '',
  messageLabel: '',
  messagePlaceholder: '',
  initialMessage: '',
  // Keep a stable no-op submit handler so we can keep the modal mounted and warm
  onSubmit: async () => {},
};

export function useReportModal() {
  const [state, setState] = useState<{
    open: boolean;
    config: OpenReportParams;
    isLoading: boolean;
  }>({
    open: false,
    config: DEFAULT_MODAL_CONFIG,
    isLoading: false,
  });

  const openReport = useCallback((params: OpenReportParams) => {
    // Immediately open a lightweight modal shell, then hydrate content after a tick
    setState({ open: true, config: params, isLoading: true });
    setTimeout(() => {
      startTransition(() => {
        setState({ open: true, config: params, isLoading: false });
      });
    }, 40);
  }, []);

  const closeReport = useCallback(() => {
    startTransition(() => {
      setState((prev) => ({ ...prev, open: false, isLoading: false }));
    });
  }, []);

  const ReportModalElement = useMemo(
    () => (
      <ReportModal
        open={state.open}
        onClose={closeReport}
        title={state.config.title}
        subtitle={state.config.subtitle}
        contextSnippet={state.config.contextSnippet}
        reportType={state.config.reportType}
        reportedName={state.config.reportedName}
        messageLabel={state.config.messageLabel}
        messagePlaceholder={state.config.messagePlaceholder}
        initialMessage={state.config.initialMessage}
        onSubmit={state.config.onSubmit}
        isLoading={state.isLoading}
      />
    ),
    [closeReport, state],
  );

  return { openReport, closeReport, ReportModalElement };
}
