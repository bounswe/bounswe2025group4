import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, MapPin, DollarSign, Accessibility } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import { WorkplaceCard } from '@/modules/workplace/components/WorkplaceCard';
import { useJobQuery } from '@modules/jobs/services/jobs.service';
import { cn } from '@shared/lib/utils';
import { normalizeApiError } from '@shared/utils/error-handler';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';

  const jobId = id ? parseInt(id, 10) : undefined;
  const jobQuery = useJobQuery(jobId);
  const job = jobQuery.data ?? null;
  const normalizedError = jobQuery.error ? normalizeApiError(jobQuery.error) : null;
  const errorMessage = normalizedError?.friendlyMessage;

  if (jobQuery.isLoading) {
    return <CenteredLoader />;
  }

  if (jobQuery.error || !job) {
    const errorTitle = jobQuery.error
      ? t('jobs.detail.error.title')
      : t('jobs.detail.error.missing');
    const displayMessage = errorMessage || t('jobs.detail.error.fetch');

    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">
          {errorTitle}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {displayMessage}
        </p>
        <Button asChild className="mt-6">
          <Link to="/jobs">{t('jobs.detail.backToJobs')}</Link>
        </Button>
      </div>
    );
  }

  // Parse contact info (might be JSON string or plain string)
  let contactInfo: { name?: string; title?: string; email?: string } = {};
  try {
    contactInfo = typeof job.contact === 'string' && job.contact.startsWith('{')
      ? JSON.parse(job.contact)
      : { email: job.contact };
  } catch {
    contactInfo = { email: job.contact };
  }

  const formatSalary = (min: number, max: number) => {
    return `$${(min / 1000).toFixed(0)},000 - $${(max / 1000).toFixed(0)},000`;
  };

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/jobs" className="hover:text-foreground transition-colors">
          {t('jobs.detail.breadcrumb.jobs')}
        </Link>
        <ChevronRight className={cn('size-4', isRtl && 'rotate-180')} aria-hidden />
        <span className="text-foreground">{job.title}</span>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl">
        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6 lg:p-8">
            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground lg:text-4xl">{job.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-base text-muted-foreground">
                  <Link
                    to={`/workplace/${job.workplace.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {job.workplace.companyName}
                  </Link>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" aria-hidden />
                    {job.remote ? t('jobs.card.remote') : job.location}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="size-4" aria-hidden />
                    {formatSalary(job.minSalary, job.maxSalary)}
                  </span>
                </div>
              </div>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link to={`/jobs/${id}/apply`}>{t('jobs.detail.applyNow')}</Link>
              </Button>
            </div>

            {/* Workplace Information */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl mb-4">
                {t('jobs.detail.workplace.title')}
              </h2>
              <WorkplaceCard workplace={job.workplace} />
            </section>

            {/* Job Description */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                {t('jobs.detail.description')}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </section>

            {/* Ethical Tags */}
            {(job.workplace.ethicalTags.length > 0 || job.inclusiveOpportunity) && (
              <section className="mt-8">
                <div className="rounded-lg bg-primary/10 p-6">
                  <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                    {t('jobs.detail.ethicalPolicy.title')}
                  </h2>

                  {/* Inclusive Opportunity Badge */}
                  {job.inclusiveOpportunity && (
                    <div className="mt-3">
                      <Badge className="bg-blue-500 text-white hover:bg-blue-600 text-sm flex items-center gap-1 w-fit">
                        <Accessibility className="size-4" aria-hidden />
                        {t('jobs.detail.inclusiveOpportunity')}
                      </Badge>
                    </div>
                  )}

                  {/* Ethical Tags */}
                  {job.workplace.ethicalTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.workplace.ethicalTags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Contact Information */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                {t('jobs.detail.contact.title')}
              </h2>
              <div className="mt-2">
                <p className="text-sm font-semibold text-foreground">{contactInfo.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{contactInfo.title}</p>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="mt-1 inline-block text-xs text-primary hover:underline"
                >
                  {contactInfo.email}
                </a>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}

