import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, MapPin, Download, ExternalLink, Trash2, FileText, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CenteredLoader from '@/components/CenteredLoader';
import type { JobApplicationResponse, JobApplicationStatus } from '@/types/api.types';
import { getApplications, deleteApplication, getCvUrl } from '@/services/applications.service';
import { getJobById } from '@/services/jobs.service';
import { useAuth } from '@/contexts/AuthContext';

type FilterType = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';

  const [applications, setApplications] = useState<JobApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [nonprofitJobs, setNonprofitJobs] = useState<Set<number>>(new Set());

  // Detail modal state
  const [selectedApplication, setSelectedApplication] = useState<JobApplicationResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Withdraw modal state
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<number | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Cache for job details to avoid repeated API calls
  const jobDetailsCache = useMemo(() => new Map(), []);

  // Helper function to get the correct job detail route
  const getJobDetailRoute = (application: JobApplicationResponse): string => {
    const isNonprofit = nonprofitJobs.has(application.jobPostId);
    return isNonprofit ? `/nonprofit-jobs/${application.jobPostId}` : `/jobs/${application.jobPostId}`;
  };

  // Function to check if a job is nonprofit (with caching)
  const checkIfNonprofitJob = async (jobPostId: number): Promise<boolean> => {
    if (jobDetailsCache.has(jobPostId)) {
      return jobDetailsCache.get(jobPostId);
    }

    try {
      const jobDetails = await getJobById(jobPostId);
      const isNonprofit = !!jobDetails.nonProfit;
      jobDetailsCache.set(jobPostId, isNonprofit);
      return isNonprofit;
    } catch (error) {
      // If we can't fetch job details, default to regular job
      console.warn(`Could not fetch details for job ${jobPostId}:`, error);
      jobDetailsCache.set(jobPostId, false);
      return false;
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        const apps = await getApplications({
          jobSeekerId: user.id,
        });

        setApplications(apps);

        // Check which jobs are nonprofit jobs (batch processing for better performance)
        const nonprofitJobIds = new Set<number>();
        const uniqueJobIds = [...new Set(apps.map(app => app.jobPostId))];

        await Promise.all(
          uniqueJobIds.map(async (jobPostId) => {
            const isNonprofit = await checkIfNonprofitJob(jobPostId);
            if (isNonprofit) {
              nonprofitJobIds.add(jobPostId);
            }
          })
        );

        setNonprofitJobs(nonprofitJobIds);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(t('myApplications.errors.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user, t, jobDetailsCache]);

  const filteredApplications = useMemo(() => {
    if (filter === 'all') {
      return applications;
    }
    return applications.filter((app) => app.status === filter);
  }, [applications, filter]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((app) => app.status === 'PENDING').length,
      approved: applications.filter((app) => app.status === 'APPROVED').length,
      rejected: applications.filter((app) => app.status === 'REJECTED').length,
    };
  }, [applications]);

  const handleWithdraw = async () => {
    if (!applicationToWithdraw) return;

    try {
      setIsWithdrawing(true);
      await deleteApplication(applicationToWithdraw);

      // Remove from list
      setApplications((prev) => prev.filter((app) => app.id !== applicationToWithdraw));

      setApplicationToWithdraw(null);
    } catch (err) {
      console.error('Error withdrawing application:', err);
      setError(t('myApplications.withdraw.error'));
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleDownloadCV = async (applicationId: number) => {
    try {
      const cvUrl = await getCvUrl(applicationId);
      // Open in new tab
      window.open(cvUrl, '_blank');
    } catch (err) {
      console.error('Error downloading CV:', err);
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString(resolvedLanguage, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeVariant = (status: JobApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return 'default';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error && applications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">{error}</h1>
        <Button onClick={() => window.location.reload()} className="mt-6">
          {t('jobs.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
          {t('myApplications.title')}
        </h1>
        <p className="mt-2 text-muted-foreground">{t('myApplications.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('myApplications.stats.total')}</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('myApplications.stats.pending')}</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('myApplications.stats.approved')}</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('myApplications.stats.rejected')}</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as FilterType[]).map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'default' : 'outline'}
            onClick={() => setFilter(filterOption)}
            size="sm"
          >
            {t(`myApplications.filters.${filterOption.toLowerCase()}`)}
          </Button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('myApplications.empty.title')}</h2>
          <p className="text-muted-foreground mb-6">{t('myApplications.empty.message')}</p>
          <Button asChild>
            <Link to="/jobs">{t('myApplications.empty.browseJobs')}</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card
              key={application.id}
              className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Application Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <Briefcase className="h-5 w-5 text-primary mt-1 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {application.title}
                          </h3>
                          {nonprofitJobs.has(application.jobPostId) && (
                            <Badge
                              variant="secondary"
                              className="border-0 bg-green-500 text-xs font-medium text-white hover:bg-green-600 flex items-center gap-1"
                            >
                              <Heart className="size-3" aria-hidden />
                              {t('nonProfitJobs.volunteerOpportunity')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{application.company}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {t('myApplications.applicationCard.appliedOn', {
                          date: formatDate(application.appliedDate),
                        })}
                      </span>
                      <Badge
                        variant={getStatusBadgeVariant(application.status)}
                        className="font-medium"
                      >
                        {t(`myApplications.applicationCard.status.${application.status}`)}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(application);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      {t('myApplications.applicationCard.actions.viewDetails')}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={getJobDetailRoute(application)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t('myApplications.applicationCard.actions.viewJob')}
                      </Link>
                    </Button>
                    {application.cvUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCV(application.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t('myApplications.applicationCard.actions.downloadCV')}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setApplicationToWithdraw(application.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('myApplications.details.title')}</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{selectedApplication.title}</h3>
                  {nonprofitJobs.has(selectedApplication.jobPostId) && (
                    <Badge
                      variant="secondary"
                      className="border-0 bg-green-500 text-xs font-medium text-white hover:bg-green-600 flex items-center gap-1"
                    >
                      <Heart className="size-3" aria-hidden />
                      {t('nonProfitJobs.volunteerOpportunity')}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{selectedApplication.company}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('myApplications.details.status')}:</span>
                  <Badge
                    variant={getStatusBadgeVariant(selectedApplication.status)}
                    className="ml-2"
                  >
                    {t(`myApplications.applicationCard.status.${selectedApplication.status}`)}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('myApplications.details.appliedDate')}:</span>
                  <span className="ml-2">{formatDate(selectedApplication.appliedDate)}</span>
                </div>
              </div>

              {selectedApplication.coverLetter && (
                <div>
                  <h4 className="font-medium mb-2">{t('myApplications.details.coverLetter')}</h4>
                  <div className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {selectedApplication.coverLetter}
                  </div>
                </div>
              )}

              {selectedApplication.specialNeeds && (
                <div>
                  <h4 className="font-medium mb-2">{t('myApplications.details.specialNeeds')}</h4>
                  <div className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {selectedApplication.specialNeeds}
                  </div>
                </div>
              )}

              {selectedApplication.feedback && (
                <div>
                  <h4 className="font-medium mb-2">{t('myApplications.details.feedback')}</h4>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md text-sm whitespace-pre-wrap">
                    {selectedApplication.feedback}
                  </div>
                </div>
              )}

              {selectedApplication.cvUrl && (
                <div>
                  <h4 className="font-medium mb-2">{t('myApplications.details.cv')}</h4>
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadCV(selectedApplication.id)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {t('myApplications.details.downloadCV')}
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              {t('myApplications.details.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Confirmation Modal */}
      <Dialog open={applicationToWithdraw !== null} onOpenChange={(open) => !open && setApplicationToWithdraw(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('myApplications.withdraw.title')}</DialogTitle>
            <DialogDescription>{t('myApplications.withdraw.message')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApplicationToWithdraw(null)}
              disabled={isWithdrawing}
            >
              {t('myApplications.withdraw.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? t('jobs.retry') : t('myApplications.withdraw.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
