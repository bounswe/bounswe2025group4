import { useMemo } from 'react';
import { AlertCircle, Heart, Leaf, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NonProfitJobCard } from '@modules/jobs/components/jobs/NonProfitJobCard';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent } from '@shared/components/ui/card';
import { type Job } from '@shared/types/job';
import { useJobsQuery } from '@modules/jobs/services/jobs.service';
import type { JobPostResponse } from '@shared/types/api.types';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import { normalizeApiError } from '@shared/utils/error-handler';

/**
 * Convert API JobPostResponse to Job type for NonProfitJobCard component
 */
function convertJobPostToJob(jobPost: JobPostResponse): Job {
  return {
    id: jobPost.id.toString(),
    title: jobPost.title,
    description: jobPost.description,
    workplace: jobPost.workplace,
    location: jobPost.remote ? 'Remote' : jobPost.location,
    type: ['Contract'], // Using 'Contract' type for volunteer/nonprofit positions
    minSalary: 0, // Non-profit jobs don't have salary
    maxSalary: 0,
    logoUrl: jobPost.workplace.imageUrl,
    inclusiveOpportunity: jobPost.inclusiveOpportunity,
    nonProfit: jobPost.nonProfit,
  };
}

export default function NonProfitJobsPage() {
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';

  const jobsQuery = useJobsQuery({ nonProfit: true });
  const jobs = useMemo(
    () => ((jobsQuery.data ?? []) as JobPostResponse[]).map(convertJobPostToJob),
    [jobsQuery.data],
  );
  const normalizedError = jobsQuery.error ? normalizeApiError(jobsQuery.error) : null;
  const isAuthError = normalizedError?.status === 401;
  const hasError = Boolean(jobsQuery.error);
  const errorMessage = normalizedError?.friendlyMessage;
  const isLoading = jobsQuery.isLoading;
  const jobCount = jobs.length;

  return (
    <div className="container mx-auto px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="mb-12 text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3 text-green-600">
            <Heart className="size-8" />
            <Leaf className="size-8" />
            <Users className="size-8" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {t('volunteering.pageTitle')}
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('volunteering.pageDescription')}
          </p>
        </div>

        <div className="flex justify-center gap-8 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-red-500" />
            <span>{t('volunteering.features.meaningful')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="size-4 text-green-500" />
            <span>{t('volunteering.features.sustainable')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-blue-500" />
            <span>{t('volunteering.features.community')}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <CenteredLoader />
        ) : hasError ? (
          isAuthError ? (
            <Card className="gap-4 py-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <CardContent className="px-4 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                      {t('jobs.authRequired.title')}
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {t('volunteering.authRequired.description')}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {t('jobs.authRequired.invitation')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600">
                    <Link to="/register">{t('jobs.authRequired.signUp')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-amber-300 dark:border-amber-700">
                    <Link to="/login">{t('jobs.authRequired.login')}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-lg text-destructive">{errorMessage || t('jobs.error')}</p>
              <Button onClick={() => window.location.reload()}>{t('jobs.retry')}</Button>
            </div>
          )
        ) : (
          <>
            <div className="flex flex-col gap-2 mb-8">
              <h2 className="text-2xl font-semibold">
                {t('volunteering.availableOpportunities', { count: jobCount })}
              </h2>
              <span className="text-sm text-muted-foreground">
                {t('volunteering.opportunitiesDescription', { count: jobCount })}
              </span>
            </div>

            {/* Job Cards */}
            {jobCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
                <div className="flex items-center gap-2 text-6xl text-muted-foreground/20">
                  <Heart />
                  <Leaf />
                  <Users />
                </div>
                <div className="space-y-2">
                  <p className="text-xl text-muted-foreground">
                    {t('volunteering.noOpportunities')}
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {t('volunteering.checkBackSoon')}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/jobs">{t('volunteering.browseRegularJobs')}</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <NonProfitJobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

