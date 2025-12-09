import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Badge } from '@shared/components/ui/badge';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Avatar, AvatarFallback } from '@shared/components/ui/avatar';
import { Label } from '@shared/components/ui/label';
import {
  useApplicationQuery,
  useApproveApplicationMutation,
  useRejectApplicationMutation,
  useApplicationCvUrlQuery,
} from '@modules/jobs/applications/services/applications.service';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import type { JobApplicationStatus } from '@shared/types/api.types';

const statusVariants: Record<JobApplicationStatus, 'default' | 'success' | 'destructive'> = {
  PENDING: 'default',
  APPROVED: 'success',
  REJECTED: 'destructive',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase() || '?';

export default function JobApplicationReviewPage() {
  const { t, i18n } = useTranslation('common');
  const { jobId, applicationId } = useParams<{ jobId: string; applicationId: string }>();
  const navigate = useNavigate();
  const applicationIdNumber = applicationId ? parseInt(applicationId, 10) : undefined;
  const [feedback, setFeedback] = useState('');
  const {
    data: application,
    isLoading,
  } = useApplicationQuery(applicationIdNumber, Boolean(applicationIdNumber));
  const { data: cvUrl, isLoading: isCvLoading } = useApplicationCvUrlQuery(
    applicationIdNumber,
    Boolean(applicationIdNumber),
  );

  const approveMutation = useApproveApplicationMutation(applicationIdNumber ?? 0);
  const rejectMutation = useRejectApplicationMutation(applicationIdNumber ?? 0);
  const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';
  const hasCoverLetter = Boolean(application?.coverLetter?.trim());
  const hasSpecialNeeds = Boolean(application?.specialNeeds?.trim());

  const handleApprove = async () => {
    if (!applicationIdNumber) return;
    try {
      await approveMutation.mutateAsync(feedback || undefined);
      toast.success(
        t('applications.review.success.approve', {
          defaultValue: 'Application approved successfully.',
        }),
      );
      navigate(`/employer/jobs/${jobId}`);
    } catch (err) {
      console.error('Error approving application:', err);
    }
  };

  const handleReject = async () => {
    if (!applicationIdNumber) return;

    try {
      await rejectMutation.mutateAsync(feedback || undefined);
      navigate(`/employer/jobs/${jobId}`);
    } catch (err) {
      console.error('Error rejecting application:', err);
    }
  };

  const formatRelativeDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('applications.review.appliedToday');
    if (diffDays === 1) return t('applications.review.appliedYesterday');
    return t('applications.review.appliedDaysAgo', { count: diffDays });
  };

  const formatAbsoluteDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString(resolvedLanguage, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const statusLabel = (status: JobApplicationStatus) =>
    t(`applications.mine.applicationCard.status.${status}`, {
      defaultValue: status.toLowerCase(),
    });

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">{t('applications.review.error.title')}</h1>
        <Button asChild className="mt-6">
          <Link to={`/employer/jobs/${jobId}`}>{t('applications.review.backToJob')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <Button variant="ghost" size="sm" asChild className="gap-2 px-0">
                <Link to={`/employer/jobs/${jobId}/applications`}>
                  <ArrowLeft className="size-4" aria-hidden />
                  {t('applications.review.backToApplications')}
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
              {t('applications.review.title', { jobTitle: application.title })}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-base text-muted-foreground">
              <Badge variant={statusVariants[application.status]} className="capitalize">
                {statusLabel(application.status)}
              </Badge>
              <Badge variant="secondary" className="gap-2">
                <CalendarClock className="size-4" aria-hidden />
                {t('applications.list.appliedOn', {
                  defaultValue: 'Applied on {{date}}',
                  date: formatAbsoluteDate(application.appliedDate),
                })}
              </Badge>
              <Badge variant="outline">
                {t('applications.review.applied')} {formatRelativeDate(application.appliedDate)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-1 gap-4">
                <Avatar className="size-16 rounded-lg border border-border bg-muted">
                  <AvatarFallback className="rounded-lg text-lg font-semibold">
                    {getInitials(application.applicantName)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">{application.applicantName}</p>
                  <p className="text-base text-muted-foreground">
                    {t('applications.review.status')}: {statusLabel(application.status)}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {t('applications.review.applied')} {formatRelativeDate(application.appliedDate)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {application.coverLetter && (
                  <Badge variant="secondary">
                    {t('applications.list.hasCoverLetter', { defaultValue: 'Cover letter' })}
                  </Badge>
                )}
                {application.specialNeeds && (
                  <Badge variant="warning" className="gap-1">
                    {t('applications.list.hasNeeds', { defaultValue: 'Special needs noted' })}
                  </Badge>
                )}
                {cvUrl && (
                  <Badge variant="secondary" className="gap-1">
                    {t('applications.review.cv')}
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          {(hasCoverLetter || hasSpecialNeeds) && (
            <div className="grid gap-4 md:grid-cols-2">
              {hasCoverLetter && (
                <Card className="border border-border bg-card shadow-sm">
                  <div className="p-6 space-y-3">
                    <h2 className="text-xl font-semibold">{t('applications.review.coverLetter')}</h2>
                    <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {application.coverLetter}
                    </p>
                  </div>
                </Card>
              )}

              {hasSpecialNeeds && (
                <Card className="border border-border bg-card shadow-sm">
                  <div className="p-6 space-y-3">
                    <h2 className="text-xl font-semibold">{t('applications.review.specialNeeds')}</h2>
                    <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {application.specialNeeds}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}

          <Card className="border border-border bg-card shadow-sm">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">{t('applications.review.cv')}</h2>
              {isCvLoading ? (
                <p className="text-base text-muted-foreground">{t('applications.review.loadingCv')}</p>
              ) : cvUrl ? (
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/50 p-4">
                  <div className="flex-shrink-0">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <FileText className="size-6 text-primary" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium text-foreground">
                      {t('applications.review.resumeOf', { name: application.applicantName })}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {t('applications.review.downloadToView')}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-2"
                    >
                      <Download className="size-4" aria-hidden />
                      {t('applications.review.download')}
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-center text-base text-muted-foreground">
                  {t('applications.review.noCvAttached')}
                </div>
              )}
            </div>
          </Card>

          {application.feedback ? (
            <Card className="border border-border bg-card shadow-sm">
              <div className="px-6">
                <h2 className="mb-3 text-xl font-semibold">{t('applications.review.existingFeedback')}</h2>
                <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {application.feedback}
                </p>
              </div>
            </Card>
          ) : ( // can we change the feedback again ??? TODO
            <Card className="border border-border bg-card shadow-sm">
              <div className="px-6 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">{t('applications.review.decision')}</h2>
                  <p className="text-base text-muted-foreground">
                    {t('applications.review.feedbackHelper', {
                      defaultValue: 'Add a note for the candidate before making your decision.',
                    })}
                  </p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="feedback" className="text-base font-medium">
                    {t('applications.review.feedback')}
                  </Label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={t('applications.review.feedbackPlaceholder')}
                    disabled={isSubmitting}
                    className="mt-1 w-full min-h-[120px] resize-y rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="sm:min-w-[140px]"
                  >
                    {isSubmitting ? t('applications.review.processing') : t('applications.review.reject')}
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:min-w-[140px]"
                  >
                    {isSubmitting ? t('applications.review.processing') : t('applications.review.approve')}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}