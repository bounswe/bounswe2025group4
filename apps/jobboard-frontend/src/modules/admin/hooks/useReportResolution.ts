import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveReport } from '../services/admin.service';
import type { ResolveReportRequest, ReportStatus } from '../types/admin.types';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

type ResolveAction = 'dismiss' | 'remove' | 'ban' | 'both';

export function useReportResolution(reportId: number | null, onSuccess?: () => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveAction, setResolveAction] = useState<ResolveAction | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [banReason, setBanReason] = useState('');
  const [deleteContent, setDeleteContent] = useState(false);
  const [banUser, setBanUser] = useState(false);

  const resolveMutation = useMutation({
    mutationFn: (request: ResolveReportRequest) => {
      if (!reportId) throw new Error('No report ID provided');
      return resolveReport(reportId, request);
    },
    onSuccess: (_, request) => {
      let messageKey = 'admin.reports.resolve.success.default';

      if (request.banUser && request.deleteContent) {
        messageKey = 'admin.reports.resolve.success.both';
      } else if (request.banUser) {
        messageKey = 'admin.reports.resolve.success.ban';
      } else if (request.deleteContent) {
        messageKey = 'admin.reports.resolve.success.remove';
      } else if (request.status === 'IGNORED') {
        messageKey = 'admin.reports.resolve.success.dismiss';
      }

      toast.success(t(messageKey));
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'report', reportId] });
      resetState();
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || '';
      let messageKey = 'admin.reports.resolve.error.default';

      // Map specific error types to translation keys
      if (errorMessage.toLowerCase().includes('spam')) {
        messageKey = 'admin.reports.resolve.error.spam';
      } else if (errorMessage.toLowerCase().includes('fake')) {
        messageKey = 'admin.reports.resolve.error.fake';
      } else if (errorMessage.toLowerCase().includes('offensive')) {
        messageKey = 'admin.reports.resolve.error.offensive';
      } else if (errorMessage.toLowerCase().includes('harassment')) {
        messageKey = 'admin.reports.resolve.error.harassment';
      } else if (errorMessage.toLowerCase().includes('misinformation')) {
        messageKey = 'admin.reports.resolve.error.misinformation';
      }

      toast.error(t(messageKey));
    },
  });

  const handleResolve = (action: ResolveAction) => {
    if (!reportId) return;

    setResolveAction(action);
    setDeleteContent(action === 'remove' || action === 'both');
    setBanUser(action === 'ban' || action === 'both');
    setAdminNote('');
    setBanReason(action === 'ban' || action === 'both' ? '' : '');
    setShowResolveDialog(true);
  };

  const confirmResolve = () => {
    if (!reportId || !resolveAction) return;

    const statusMap: Record<ResolveAction, ReportStatus> = {
      dismiss: 'IGNORED',
      remove: 'APPROVED',
      ban: 'APPROVED',
      both: 'APPROVED',
    };

    const request: ResolveReportRequest = {
      status: statusMap[resolveAction],
      adminNote: adminNote.trim() || undefined,
      deleteContent: deleteContent || undefined,
      banUser: banUser || undefined,
      banReason: banUser && banReason.trim() ? banReason.trim() : undefined,
    };

    resolveMutation.mutate(request);
  };

  const resetState = () => {
    setShowResolveDialog(false);
    setAdminNote('');
    setBanReason('');
    setDeleteContent(false);
    setBanUser(false);
    setResolveAction(null);
  };

  return {
    // State
    showResolveDialog,
    resolveAction,
    adminNote,
    banReason,
    deleteContent,
    banUser,
    isProcessing: resolveMutation.isPending,

    // State setters
    setShowResolveDialog,
    setAdminNote,
    setBanReason,

    // Actions
    handleResolve,
    confirmResolve,
    resetState,
  };
}
