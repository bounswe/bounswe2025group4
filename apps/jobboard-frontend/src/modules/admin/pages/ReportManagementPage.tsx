import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { getReports, getReportDetails, resolveReport } from '../services/admin.service';
import type {
  ReportListItem,
  ReportStatus,
  ReportableEntityType,
  ResolveReportRequest,
} from '../types/admin.types';
import { toast } from 'react-toastify';
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

type TabType = 'PENDING' | 'APPROVED' | 'IGNORED' | 'ALL';

export function ReportManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [adminNote, setAdminNote] = useState('');
  const [banReason, setBanReason] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveAction, setResolveAction] = useState<'dismiss' | 'remove' | 'ban' | null>(null);
  const [deleteContent, setDeleteContent] = useState(false);
  const [banUser, setBanUser] = useState(false);

  const queryClient = useQueryClient();

  // Map tab to status
  const getStatusFromTab = (tab: TabType): ReportStatus | undefined => {
    if (tab === 'ALL') return undefined;
    return tab as ReportStatus;
  };

  // Fetch reports for current tab
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['admin', 'reports', activeTab, page],
    queryFn: () => getReports(getStatusFromTab(activeTab), undefined, page, 20),
  });

  // Fetch all reports for counts (without status filter)
  const { data: allReportsData } = useQuery({
    queryKey: ['admin', 'reports', 'all', 'counts'],
    queryFn: () => getReports(undefined, undefined, 0, 1000), // Get all for counting
  });

  // Fetch selected report details
  const { data: selectedReport } = useQuery({
    queryKey: ['admin', 'report', selectedReportId],
    queryFn: () => getReportDetails(selectedReportId!),
    enabled: selectedReportId !== null,
  });

  // Resolve report mutation
  const resolveMutation = useMutation({
    mutationFn: (request: ResolveReportRequest) => resolveReport(selectedReportId!, request),
    onSuccess: (_, request) => {
      let message = 'Report resolved successfully';
      if (request.banUser) {
        message = 'User has been banned and report resolved successfully';
      } else if (request.deleteContent) {
        message = 'Content has been removed and report resolved successfully';
      } else if (request.status === 'IGNORED') {
        message = 'Report has been dismissed';
      }
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'report', selectedReportId] });
      setShowResolveDialog(false);
      setAdminNote('');
      setBanReason('');
      setDeleteContent(false);
      setBanUser(false);
      setSelectedReportId(null);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to resolve report';
      // Make error messages more descriptive
      let descriptiveMessage = errorMessage;
      if (errorMessage.toLowerCase().includes('spam')) {
        descriptiveMessage = 'This content has been reported as spam. Please review and take appropriate action.';
      } else if (errorMessage.toLowerCase().includes('fake')) {
        descriptiveMessage = 'This content has been reported as containing fake information. Please verify and take action.';
      } else if (errorMessage.toLowerCase().includes('offensive')) {
        descriptiveMessage = 'This content has been reported as offensive. Please review the content carefully.';
      } else if (errorMessage.toLowerCase().includes('harassment')) {
        descriptiveMessage = 'This content has been reported for harassment. This is a serious violation.';
      } else if (errorMessage.toLowerCase().includes('misinformation')) {
        descriptiveMessage = 'This content has been reported as misinformation. Please verify the facts.';
      }
      toast.error(descriptiveMessage);
    },
  });

  const handleResolve = (action: 'dismiss' | 'remove' | 'ban') => {
    if (!selectedReportId) return;

    setResolveAction(action);
    setDeleteContent(action === 'remove' || action === 'ban');
    setBanUser(action === 'ban');
    setAdminNote('');
    setBanReason(action === 'ban' ? '' : '');
    setShowResolveDialog(true);
  };

  const confirmResolve = () => {
    if (!selectedReportId || !resolveAction) return;

    const statusMap: Record<'dismiss' | 'remove' | 'ban', ReportStatus> = {
      dismiss: 'IGNORED',
      remove: 'APPROVED',
      ban: 'APPROVED',
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

  const getStatusBadge = (status: ReportStatus) => {
    const variants: Record<ReportStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING: 'default',
      APPROVED: 'secondary',
      REJECTED: 'destructive',
      IGNORED: 'outline',
    };

    return (
      <Badge variant={variants[status]}>
        {status}
      </Badge>
    );
  };

  const getEntityTypeLabel = (type: ReportableEntityType): string => {
    const labels: Record<ReportableEntityType, string> = {
      FORUM_POST: 'Forum Post',
      FORUM_COMMENT: 'Comment',
      WORKPLACE: 'Workplace',
      REVIEW: 'Workplace Review',
      REVIEW_REPLY: 'Review Reply',
      JOB_POST: 'Job Post',
      JOB_APPLICATION: 'Job Application',
      PROFILE: 'Profile',
      MENTOR: 'Mentor',
    };
    return labels[type] || type;
  };

  const getReasonLabel = (reason: string): string => {
    const labels: Record<string, string> = {
      SPAM: 'Spam Content',
      FAKE: 'Fake Information',
      OFFENSIVE: 'Offensive Content',
      HARASSMENT: 'Harassment',
      MISINFORMATION: 'Misinformation',
      OTHER: 'Other',
    };
    return labels[reason] || reason;
  };

  const getReasonBadge = (reason: string) => {
    const colorMap: Record<string, 'default' | 'destructive' | 'secondary'> = {
      SPAM: 'secondary',
      FAKE: 'secondary',
      OFFENSIVE: 'destructive',
      HARASSMENT: 'destructive',
      MISINFORMATION: 'default',
      OTHER: 'default',
    };
    return <Badge variant={colorMap[reason] || 'default'}>{getReasonLabel(reason)}</Badge>;
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
          <h1 className="text-3xl font-bold">Report Management</h1>
          <p className="text-muted-foreground mt-2">
            Review and take action on reported content and users.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
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
            Pending {pendingCount > 0 && `(${pendingCount})`}
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
            Resolved {resolvedCount > 0 && `(${resolvedCount})`}
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
            Dismissed {dismissedCount > 0 && `(${dismissedCount})`}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports Table */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reports found
                  </div>
                ) : (
                  <>
                    <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead>Content Type</TableHead>
                            <TableHead>Reported Item</TableHead>
                            <TableHead>Reporter</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
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
                              <TableCell className="text-sm text-muted-foreground">
                                {format(new Date(report.createdAt), 'yyyy-MM-dd')}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedReportId(report.id)}
                                >
                                  View
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
                          Page {page + 1} of {reportsData.totalPages} ({reportsData.totalElements} total)
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
            </Card>
          </div>

          {/* Investigation Details Panel */}
          <div className="lg:col-span-1">
            {selectedReport ? (
              <div className="space-y-4">
                {/* Content Under Review */}
                <Card>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Investigation Details</h3>
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
                        <Label className="text-xs text-muted-foreground">Content Under Review</Label>
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
                        <Label className="text-xs text-muted-foreground">Reporter Information</Label>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Reporter:</span> {selectedReport.createdByUsername}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Reason:</span>{' '}
                            <span className="ml-1">{getReasonLabel(selectedReport.reasonType)}</span>
                          </p>
                          <div className="mt-1">
                            {getReasonBadge(selectedReport.reasonType)}
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">Status:</span> {getStatusBadge(selectedReport.status)}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {selectedReport.status === 'PENDING' && (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-3 block">Moderation Actions</Label>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleResolve('dismiss')}
                            >
                              Dismiss Report
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start bg-yellow-50 hover:bg-yellow-100 border-yellow-300"
                              onClick={() => handleResolve('remove')}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Content
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                              onClick={() => handleResolve('ban')}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban User
                            </Button>
                          </div>
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
                    Select a report to view details
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
              {resolveAction === 'dismiss' && 'Dismiss Report'}
              {resolveAction === 'remove' && 'Remove Content'}
              {resolveAction === 'ban' && 'Ban User'}
            </DialogTitle>
            <DialogDescription>
              {resolveAction === 'dismiss' &&
                'This will mark the report as dismissed. No action will be taken on the reported content.'}
              {resolveAction === 'remove' &&
                'This will remove the reported content and mark the report as approved.'}
              {resolveAction === 'ban' &&
                'This will ban the user who created the content, remove the content, and mark the report as approved.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-note">Admin Note (Optional)</Label>
              <Textarea
                id="admin-note"
                placeholder="Add a note about this action..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
            </div>

            {resolveAction === 'ban' && (
              <div className="space-y-2">
                <Label htmlFor="ban-reason">Ban Reason (Optional)</Label>
                <Textarea
                  id="ban-reason"
                  placeholder="Reason for banning this user..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmResolve} disabled={resolveMutation.isPending}>
              {resolveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
