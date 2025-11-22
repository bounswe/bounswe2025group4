import { useState, useCallback } from 'react';
import { ReportModal } from '@/components/report/ReportModal';

interface OpenReportParams {
  title: string;
  subtitle?: string;
  contextSnippet?: string;
  reportType?: string;
  reportedName?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  initialMessage?: string;
  onSubmit: (message: string) => Promise<void> | void;
}

export function useReportModal() {
  const [modalConfig, setModalConfig] = useState<OpenReportParams | null>(null);
  const [open, setOpen] = useState(false);

  const openReport = useCallback((params: OpenReportParams) => {
    setModalConfig(params);
    setOpen(true);
  }, []);

  const closeReport = useCallback(() => {
    setOpen(false);
    // Optional: clear config after close animation if needed, but keeping it is fine
  }, []);

  const ReportModalElement = modalConfig ? (
    <ReportModal
      open={open}
      onClose={closeReport}
      title={modalConfig.title}
      subtitle={modalConfig.subtitle}
      contextSnippet={modalConfig.contextSnippet}
      reportType={modalConfig.reportType}
      reportedName={modalConfig.reportedName}
      messageLabel={modalConfig.messageLabel}
      messagePlaceholder={modalConfig.messagePlaceholder}
      initialMessage={modalConfig.initialMessage}
      onSubmit={modalConfig.onSubmit}
    />
  ) : null;

  return { openReport, closeReport, ReportModalElement };
}
