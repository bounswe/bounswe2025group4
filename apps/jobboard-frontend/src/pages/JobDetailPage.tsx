import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CenteredLoader from '@/components/CenteredLoader';
import type { JobPostResponse } from '@/types/api.types';
import { getJobById } from '@/services/jobs.service';
import { cn } from '@/lib/utils';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobPostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const jobData = await getJobById(parseInt(id, 10));
        setJob(jobData);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('fetch_error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error || !job) {
    const errorTitle = error
      ? t('jobDetail.error.title')
      : t('jobDetail.error.missing');
    const errorMessage = error
      ? t('jobDetail.error.fetch')
      : t('jobDetail.error.description');

    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">
          {errorTitle}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {errorMessage}
        </p>
        <Button asChild className="mt-6">
          <Link to="/jobs">{t('jobDetail.backToJobs')}</Link>
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
          {t('jobDetail.breadcrumb.jobs')}
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
                  <span className="font-medium">{job.company}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" aria-hidden />
                    {job.location}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="size-4" aria-hidden />
                    {formatSalary(job.minSalary, job.maxSalary)}
                  </span>
                </div>
              </div>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link to={`/jobs/${id}/apply`}>{t('jobDetail.applyNow')}</Link>
              </Button>
            </div>

            {/* Job Description */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                {t('jobDetail.description')}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </section>

            {/* Ethical Tags */}
            {job.ethicalTags && (
              <section className="mt-8">
                <div className="rounded-lg bg-primary/10 p-6">
                  <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                    {t('jobDetail.ethicalPolicy.title')}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.ethicalTags.split(',').map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                  {job.inclusiveOpportunity && (
                    <div className="mt-3">
                      <Badge variant="success" className="text-sm">
                        {t('jobDetail.inclusiveOpportunity')}
                      </Badge>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Contact Information */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                {t('jobDetail.contact.title')}
              </h2>
              <Card className="mt-4 border border-border bg-background">
                <div className="p-6">
                  <p className="font-semibold text-foreground">{contactInfo.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{contactInfo.title}</p>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="mt-2 inline-block text-sm text-primary hover:underline"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </Card>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
