import { startTransition, useCallback, useMemo, useState } from 'react';
import { ReportModal, type ReportReasonType } from '@/modules/shared/components/report/ReportModal';

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
  onSubmit: async () => {},
};

export function useReportModal() {
  const [state, setState] = useState<{
    open: boolean;
    config: OpenReportParams;
  }>({
    open: false,
    config: DEFAULT_MODAL_CONFIG,
  });

  const openReport = useCallback(async (params: OpenReportParams): Promise<void> => {
    startTransition(() => {
      setState({ open: true, config: params });
    });
  }, []);

  const closeReport = useCallback(async (): Promise<void> => {
    startTransition(() => {
      setState((prev) => ({ ...prev, open: false }));
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
      />
    ),
    [closeReport, state],
  );

  return { openReport, closeReport, ReportModalElement };
}
