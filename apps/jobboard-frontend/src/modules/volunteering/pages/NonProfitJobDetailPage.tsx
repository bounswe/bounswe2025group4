import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Heart, Accessibility } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import { WorkplaceCard } from '@modules/workplace/components/workplace/WorkplaceCard';
import type { JobPostResponse } from '@shared/types/api.types';
import { getJobById } from '@modules/jobs/services/jobs.service';
import { cn } from '@shared/lib/utils';

export default function NonProfitJobDetailPage() {
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
        console.error('Error fetching nonprofit job:', err);
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
          <Link to="/nonprofit-jobs">{t('nonProfitJobs.backToOpportunities')}</Link>
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

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/nonprofit-jobs" className="hover:text-foreground transition-colors">
          {t('nonProfitJobs.volunteer')}
        </Link>
        <ChevronRight className={cn('size-4', isRtl && 'rotate-180')} aria-hidden />
        <span className="text-foreground">{job.title}</span>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl">
        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6 lg:p-8">
            {/* Header Section - Simplified for nonprofit */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-1">
                    <Heart className="size-3" aria-hidden />
                    {t('nonProfitJobs.volunteerOpportunity')}
                  </Badge>
                  {job.inclusiveOpportunity && (
                    <Badge className="bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1">
                      <Accessibility className="size-3" aria-hidden />
                      {t('jobDetail.inclusiveOpportunity')}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-foreground lg:text-4xl">{job.title}</h1>
                <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                  {t('nonProfitJobs.makeADifferenceDescription')}
                </p>
              </div>
              <Button size="lg" className="bg-green-600 text-white hover:bg-green-700" asChild>
                <Link to={`/nonprofit-jobs/${id}/apply`}>{t('nonProfitJobs.volunteerNow')}</Link>
              </Button>
            </div>

            {/* About the Organization */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl mb-4">
                {t('nonProfitJobs.aboutOrganization')}
              </h2>
              <WorkplaceCard workplace={job.workplace} />
            </section>

            {/* Opportunity Description */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                {t('nonProfitJobs.opportunityDescription')}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </section>

            {/* What You'll Gain */}
            <section className="mt-8">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-6">
                <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 lg:text-2xl">
                  {t('nonProfitJobs.whatYouGain.title')}
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-green-800 dark:text-green-200">
                  <li>• {t('nonProfitJobs.whatYouGain.experience')}</li>
                  <li>• {t('nonProfitJobs.whatYouGain.networking')}</li>
                  <li>• {t('nonProfitJobs.whatYouGain.skills')}</li>
                  <li>• {t('nonProfitJobs.whatYouGain.impact')}</li>
                  <li>• {t('nonProfitJobs.whatYouGain.purpose')}</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                {t('jobDetail.contact.title')}
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
