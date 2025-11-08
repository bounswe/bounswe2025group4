import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { getApplicationById, approveApplication, rejectApplication, getCvUrl } from '@/services/applications.service';
import type { JobApplicationResponse } from '@/types/api.types';
import CenteredLoader from '@/components/CenteredLoader';

import { useTranslation } from 'react-i18next';

export default function JobApplicationReviewPage() {
  const { t } = useTranslation('common');
  const { jobId, applicationId } = useParams<{ jobId: string; applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<JobApplicationResponse | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [isCvLoading, setIsCvLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!applicationId) return;

      try {
        setIsLoading(true);
        const appData = await getApplicationById(parseInt(applicationId, 10));
        setApplication(appData);

        // Fetch CV URL
        setIsCvLoading(true);
        try {
          const url = await getCvUrl(parseInt(applicationId, 10));
          setCvUrl(url);
        } catch (_cvErr) {
          // CV not found or error fetching - this is okay, not all applications may have CVs
          console.log(t('jobApplicationReview.noCv'));
          setCvUrl(null);
        } finally {
          setIsCvLoading(false);
        }
      } catch (err) {
        console.error('Error fetching application:', err);
        toast.error(t('jobApplicationReview.error.load'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, t]);

  const handleApprove = async () => {
    if (!applicationId) return;

    try {
      setIsSubmitting(true);
      await approveApplication(parseInt(applicationId, 10), feedback || undefined);
      toast.success(t('jobApplicationReview.success.approve'));
      navigate(`/employer/jobs/${jobId}`);
    } catch (err) {
      console.error('Error approving application:', err);
      toast.error(t('jobApplicationReview.error.approve'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!applicationId) return;

    try {
      setIsSubmitting(true);
      await rejectApplication(parseInt(applicationId, 10), feedback || undefined);
      toast.success(t('jobApplicationReview.success.reject'));
      navigate(`/employer/jobs/${jobId}`);
    } catch (err) {
      console.error('Error rejecting application:', err);
      toast.error(t('jobApplicationReview.error.reject'));
    } finally {
      setIsSubmitting(false);
    }
  };


  // Format date
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('jobApplicationReview.applied.today');
    if (diffDays === 1) return t('jobApplicationReview.applied.yesterday');
    return t('jobApplicationReview.applied.daysAgo', { count: diffDays });
  };

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">{t('jobApplicationReview.error.title')}</h1>
        <Button asChild className="mt-6">
          <Link to={`/employer/jobs/${jobId}`}>{t('jobApplicationReview.backToJob')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
            {t('jobApplicationReview.title', { jobTitle: application.title })}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('jobApplicationReview.atCompany', { company: application.company })}
          </p>
        </div>

        <div className="space-y-6">
          {/* Applicant Information */}
          <Card className="border border-border bg-card shadow-sm">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">{t('jobApplicationReview.applicantInfo')}</h2>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar className="size-20 self-center rounded-md sm:self-start">
                  <AvatarFallback className="rounded-md text-lg font-semibold">
                    {application.applicantName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {application.applicantName}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('jobApplicationReview.status')}: {application.status}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('jobApplicationReview.applied')} {formatDate(application.appliedDate)}
                </div>
              </div>
            </div>
          </Card>

          {/* Cover Letter */}
          {application.coverLetter && (
            <Card className="border border-border bg-card shadow-sm">
              <div className="p-6">
                <h2 className="mb-4 text-xl font-semibold">{t('jobApplicationReview.coverLetter')}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {application.coverLetter}
                </p>
              </div>
            </Card>
          )}

          {/* Special Needs */}
          {application.specialNeeds && (
            <Card className="border border-border bg-card shadow-sm">
              <div className="p-6">
                <h2 className="mb-4 text-xl font-semibold">{t('jobApplicationReview.specialNeeds')}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {application.specialNeeds}
                </p>
              </div>
            </Card>
          )}

          {/* CV / Resume */}
          <Card className="border border-border bg-card shadow-sm">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">{t('jobApplicationReview.cv')}</h2>
              {isCvLoading ? (
                <p className="text-sm text-muted-foreground">{t('jobApplicationReview.loadingCv')}</p>
              ) : cvUrl ? (
                <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/50">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="size-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {t('jobApplicationReview.resumeOf', { name: application?.applicantName })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('jobApplicationReview.downloadToView')}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-2"
                    >
                      <Download className="size-4" />
                      {t('jobApplicationReview.download')}
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30">
                  <p className="text-sm text-muted-foreground text-center">
                    {t('jobApplicationReview.noCvAttached')}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Existing Feedback */}
          {application.feedback && (
            <Card className="border border-border bg-card shadow-sm">
              <div className="p-6">
                <h2 className="mb-4 text-xl font-semibold">{t('jobApplicationReview.existingFeedback')}</h2>
                <p className="text-sm text-muted-foreground">{application.feedback}</p>
              </div>
            </Card>
          )}

          {/* Decision */}
          <Card className="border border-border bg-card shadow-sm">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">{t('jobApplicationReview.decision')}</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feedback" className="text-sm font-medium">
                    {t('jobApplicationReview.feedback')}
                  </Label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={t('jobApplicationReview.feedbackPlaceholder')}
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('jobApplicationReview.processing') : t('jobApplicationReview.reject')}
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting ? t('jobApplicationReview.processing') : t('jobApplicationReview.approve')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
