import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../components/AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/components/ui/table';
import { Button } from '@shared/components/ui/button';
import { Badge } from '@shared/components/ui/badge';
import { Input } from '@shared/components/ui/input';
import { Card } from '@shared/components/ui/card';
import { Separator } from '@shared/components/ui/separator';
import { getReports, getReportDetails } from '../services/admin.service';
import type {
  ReportListItem,
  ReportStatus,
  ReportableEntityType,
} from '../types/admin.types';
import { format } from 'date-fns';
import { Search, X, Trash2, Ban, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import { Textarea } from '@shared/components/ui/textarea';
import { Label } from '@shared/components/ui/label';
import { useReportResolution } from '../hooks/useReportResolution';

type TabType = 'PENDING' | 'APPROVED' | 'IGNORED' | 'ALL';

export function ReportManagementPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  // Use custom hook for report resolution
  const {
    showResolveDialog,
    resolveAction,
    adminNote,
    banReason,
    isProcessing,
    setShowResolveDialog,
    setAdminNote,
    setBanReason,
    handleResolve,
    confirmResolve,
  } = useReportResolution(selectedReportId, () => setSelectedReportId(null));

  // Map tab to status
  const getStatusFromTab = (tab: TabType): ReportStatus | undefined => {
    if (tab === 'ALL') return undefined;
    return tab as ReportStatus;
  };

  const pageSize = 10;

  // Fetch reports for current tab
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['admin', 'reports', activeTab, page],
    queryFn: () => getReports(getStatusFromTab(activeTab), undefined, page, pageSize),
  });

  // Fetch all reports for counts
  const { data: allReportsData } = useQuery({
    queryKey: ['admin', 'reports', 'all', 'counts'],
    queryFn: () => getReports(undefined, undefined, 0, 1000),
  });

  // Fetch selected report details
  const { data: selectedReport } = useQuery({
    queryKey: ['admin', 'report', selectedReportId],
    queryFn: () => getReportDetails(selectedReportId!),
    enabled: selectedReportId !== null,
  });

  const getStatusBadge = (status: ReportStatus) => {
    const variants: Record<ReportStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING: 'default',
      APPROVED: 'secondary',
      REJECTED: 'destructive',
      IGNORED: 'outline',
    };

    return (
      <Badge variant={variants[status]}>
        {t(`admin.reports.status.${status}`)}
      </Badge>
    );
  };

  const getEntityTypeLabel = (type: ReportableEntityType): string => {
    return t(`admin.reports.entityTypes.${type}`);
  };

  const getReasonLabel = (reason: string): string => {
    return t(`admin.reports.reasons.${reason}`);
  };

  const getReasonBadge = (reason: string) => {
    const badgeMap: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; className?: string }> = {
      SPAM: { variant: 'outline', className: 'bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-400' },
      FAKE: { variant: 'outline', className: 'bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-400' },
      OFFENSIVE: { variant: 'destructive', className: 'bg-red-100 border-red-400 dark:bg-red-950 dark:border-red-800' },
      HARASSMENT: { variant: 'destructive', className: 'bg-red-100 border-red-400 dark:bg-red-950 dark:border-red-800' },
      MISINFORMATION: { variant: 'outline', className: 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-400' },
      OTHER: { variant: 'secondary' },
    };
    const config = badgeMap[reason] || { variant: 'default' };
    return <Badge variant={config.variant} className={config.className}>{getReasonLabel(reason)}</Badge>;
  };

  // Filter reports by search query
  const reports = (reportsData?.content || []).filter((report) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.entityName.toLowerCase().includes(query) ||
      report.createdByUsername.toLowerCase().includes(query) ||
      report.reasonType.toLowerCase().includes(query) ||
      getEntityTypeLabel(report.entityType).toLowerCase().includes(query)
    );
  });

  const pendingCount = allReportsData?.content?.filter((r) => r.status === 'PENDING').length || 0;
  const resolvedCount = allReportsData?.content?.filter((r) => r.status === 'APPROVED').length || 0;
  const dismissedCount = allReportsData?.content?.filter((r) => r.status === 'IGNORED').length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.reports.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('admin.reports.subtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.reports.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => {
              setActiveTab('PENDING');
              setPage(0);
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'PENDING'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('admin.reports.tabs.pending')} {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button
            onClick={() => {
              setActiveTab('APPROVED');
              setPage(0);
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'APPROVED'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('admin.reports.tabs.resolved')} {resolvedCount > 0 && `(${resolvedCount})`}
          </button>
          <button
            onClick={() => {
              setActiveTab('IGNORED');
              setPage(0);
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'IGNORED'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('admin.reports.tabs.dismissed')} {dismissedCount > 0 && `(${dismissedCount})`}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports Table */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('admin.reports.empty.title')}
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto bg-card">
                  <Table>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow>
                        <TableHead>{t('admin.reports.table.contentType')}</TableHead>
                        <TableHead>{t('admin.reports.table.reportedItem')}</TableHead>
                        <TableHead>{t('admin.reports.table.reporter')}</TableHead>
                        <TableHead>{t('admin.reports.table.reason')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('admin.reports.table.date')}</TableHead>
                        <TableHead>{t('admin.reports.table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report: ReportListItem) => (
                        <TableRow
                          key={report.id}
                          className={selectedReportId === report.id ? 'bg-muted/50' : ''}
                        >
                          <TableCell>
                            <Badge variant="outline">{getEntityTypeLabel(report.entityType)}</Badge>
                          </TableCell>
                          <TableCell
                            className="max-w-[200px] truncate cursor-pointer"
                            onClick={() => setSelectedReportId(report.id)}
                          >
                            {report.entityName}
                          </TableCell>
                          <TableCell>{report.createdByUsername}</TableCell>
                          <TableCell>{getReasonBadge(report.reasonType)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(report.createdAt), 'yyyy-MM-dd')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedReportId(report.id)}
                            >
                              {t('admin.reports.table.view')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {reportsData && reportsData.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      {t('admin.reports.pagination.pageInfo', {
                        page: page + 1,
                        totalPages: reportsData.totalPages,
                        totalElements: reportsData.totalElements
                      })}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                      >
                        &lt;
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= reportsData.totalPages - 1}
                      >
                        &gt;
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Investigation Details Panel */}
          <div className="lg:col-span-1">
            {selectedReport ? (
              <div className="space-y-4">
                <Card>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{t('admin.reports.details.title')}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setSelectedReportId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">{t('admin.reports.details.contentUnderReview')}</Label>
                        <div className="mt-2 p-3 border-l-4 border-red-500 bg-muted/30 rounded">
                          <p className="font-medium mb-1">{selectedReport.entityName}</p>
                          <p className="text-sm text-muted-foreground">
                            {getEntityTypeLabel(selectedReport.entityType)}
                          </p>
                          {selectedReport.description && (
                            <p className="text-sm mt-2 italic">"{selectedReport.description}"</p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-xs text-muted-foreground">{t('admin.reports.details.reporterInfo')}</Label>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">{t('admin.reports.details.reporter')}:</span> {selectedReport.createdByUsername}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">{t('admin.reports.details.reason')}:</span>{' '}
                            <span className="ml-1">{getReasonLabel(selectedReport.reasonType)}</span>
                          </p>
                          <div className="mt-1">
                            {getReasonBadge(selectedReport.reasonType)}
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">{t('admin.reports.details.status')}:</span> {getStatusBadge(selectedReport.status)}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {selectedReport.status === 'PENDING' && (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-3 block">{t('admin.reports.actions.title')}</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                              onClick={() => handleResolve('dismiss')}
                            >
                              <X className="h-4 w-4 mr-2" />
                              {t('admin.reports.actions.dismiss')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-center bg-yellow-50 hover:bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-950"
                              onClick={() => handleResolve('remove')}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('admin.reports.actions.remove')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-center bg-orange-50 hover:bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-950/50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
                              onClick={() => handleResolve('ban')}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              {t('admin.reports.actions.banOnly')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-center bg-red-50 hover:bg-red-100 border-red-400 text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                              onClick={() => handleResolve('both')}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('admin.reports.actions.both')}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3 text-center">
                            {t('admin.reports.actions.helper')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t('admin.reports.details.selectReport')}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {resolveAction && t(`admin.reports.dialog.${resolveAction}.title`)}
            </DialogTitle>
            <DialogDescription>
              {resolveAction && t(`admin.reports.dialog.${resolveAction}.description`)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-note">{t('admin.reports.dialog.adminNote.label')}</Label>
              <Textarea
                id="admin-note"
                placeholder={t('admin.reports.dialog.adminNote.placeholder')}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
            </div>

            {(resolveAction === 'ban' || resolveAction === 'both') && (
              <div className="space-y-2">
                <Label htmlFor="ban-reason">{t('admin.reports.dialog.banReason.label')}</Label>
                <Textarea
                  id="ban-reason"
                  placeholder={t('admin.reports.dialog.banReason.placeholder')}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              {t('admin.reports.dialog.cancel')}
            </Button>
            <Button onClick={confirmResolve} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('admin.reports.dialog.processing')}
                </>
              ) : (
                t('admin.reports.dialog.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
