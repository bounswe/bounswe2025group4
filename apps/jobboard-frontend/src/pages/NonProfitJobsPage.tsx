import { useEffect, useState } from 'react';
import { AlertCircle, Heart, Leaf, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NonProfitJobCard } from '@/components/jobs/NonProfitJobCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type Job } from '@/types/job';
import { getJobs } from '@/services/jobs.service';
import type { JobPostResponse } from '@/types/api.types';
import CenteredLoader from '@/components/CenteredLoader';
import { AxiosError } from 'axios';

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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';

  // Fetch nonprofit jobs from API
  useEffect(() => {
    const fetchNonProfitJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsAuthError(false);

        // Filter for nonprofit jobs only
        const filters = {
          nonProfit: true,
        };

        const jobPosts = await getJobs(filters);
        const convertedJobs = jobPosts.map(convertJobPostToJob);
        setJobs(convertedJobs);
      } catch (err) {
        console.error('Error fetching nonprofit jobs:', err);

        // Check if it's a 401 authentication error
        if (err instanceof AxiosError && err.response?.status === 401) {
          setIsAuthError(true);
          setError('auth_error');
        } else {
          setError('fetch_error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNonProfitJobs();
  }, []);

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
          {t('nonProfitJobs.pageTitle')}
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('nonProfitJobs.pageDescription')}
          </p>
        </div>

        <div className="flex justify-center gap-8 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-red-500" />
            <span>{t('nonProfitJobs.features.meaningful')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="size-4 text-green-500" />
            <span>{t('nonProfitJobs.features.sustainable')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-blue-500" />
            <span>{t('nonProfitJobs.features.community')}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <CenteredLoader />
        ) : error ? (
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
                      {t('nonProfitJobs.authRequired.description')}
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
              <p className="text-lg text-destructive">{t('jobs.error')}</p>
              <Button onClick={() => window.location.reload()}>{t('jobs.retry')}</Button>
            </div>
          )
        ) : (
          <>
            <div className="flex flex-col gap-2 mb-8">
              <h2 className="text-2xl font-semibold">
                {t('nonProfitJobs.availableOpportunities', { count: jobCount })}
              </h2>
              <span className="text-sm text-muted-foreground">
                {t('nonProfitJobs.opportunitiesDescription', { count: jobCount })}
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
                    {t('nonProfitJobs.noOpportunities')}
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {t('nonProfitJobs.checkBackSoon')}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/jobs">{t('nonProfitJobs.browseRegularJobs')}</Link>
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
