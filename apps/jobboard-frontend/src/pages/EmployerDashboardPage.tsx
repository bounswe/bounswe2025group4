import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getJobsByEmployer } from '@/services/jobs.service';
import { getApplications } from '@/services/applications.service';
import CenteredLoader from '@/components/CenteredLoader';
import { useAuthStore } from '@/stores/authStore';
import type { JobPostResponse } from '@/types/api.types';

type JobPosting = {
  id: number;
  title: string;
  status: string;
  applications: number;
};

export default function EmployerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';

  useEffect(() => {
    const fetchEmployerJobs = async () => {
      if (!user) {
        setError('auth');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch jobs for this employer
        const jobs = await getJobsByEmployer(user.id);

        // Fetch application counts for each job
        const getNormalizedJobId = (job: JobPostResponse) =>
          job.id ?? job.jobPostId ?? job.jobId;

        const jobsWithCounts = (
          await Promise.all(
            jobs.map(async (job) => {
              const normalizedId = getNormalizedJobId(job);

              if (normalizedId === undefined) {
                console.warn('Employer job is missing an id field', job);
                return null;
              }

              try {
                const applications = await getApplications({ jobPostId: normalizedId });
                return {
                  id: normalizedId,
                  title: job.title,
                  status: 'OPEN', // API doesn't provide status, default to OPEN
                  applications: applications.length,
                };
              } catch {
                return {
                  id: normalizedId,
                  title: job.title,
                  status: 'OPEN',
                  applications: 0,
                };
              }
            })
          )
        ).filter((job): job is JobPosting => job !== null);

        setJobPostings(jobsWithCounts);
      } catch (err) {
        console.error('Error fetching employer jobs:', err);
        setError('fetch_error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployerJobs();
  }, [user]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'default';
      case 'ACTIVE':
        return 'secondary';
      case 'PAUSED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const key = status.toLowerCase();
    return t(`employerDashboard.statusLabels.${key}`, { defaultValue: status });
  };

  const getErrorMessage = () => {
    if (error === 'auth') {
      return t('auth.login.errors.generic');
    }
    return t('employerDashboard.loadingError');
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col gap-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('employerDashboard.title')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t('employerDashboard.subtitle', {
                  defaultValue: t('employerDashboard.currentPostings'),
                })}
              </p>
            </div>
            <Button
              onClick={() => navigate('/employer/jobs/create')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t('employerDashboard.createJob')}
            </Button>
          </div>
        </header>

        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {t('employerDashboard.currentPostings')}
              </h2>
            </div>

            {isLoading ? (
              <CenteredLoader />
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-destructive mb-4">{getErrorMessage()}</p>
                <Button onClick={() => window.location.reload()}>
                  {t('jobs.retry')}
                </Button>
              </div>
            ) : jobPostings.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {t('employerDashboard.emptyState')}
                </p>
                <Button onClick={() => navigate('/employer/jobs/create')}>
                  {t('employerDashboard.emptyCta')}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">
                        {t('employerDashboard.table.jobTitle')}
                      </th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">
                        {t('employerDashboard.table.status')}
                      </th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">
                        {t('employerDashboard.table.applications')}
                      </th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">
                        {t('employerDashboard.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobPostings.map((job) => (
                      <tr key={job.id} className="border-b last:border-0">
                        <td className="py-4 text-sm text-foreground">{job.title}</td>
                        <td className="py-4">
                          <Badge variant={getStatusBadgeVariant(job.status)}>
                            {getStatusLabel(job.status)}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">{job.applications}</td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => navigate(`/employer/jobs/${job.id}`)}
                            >
                              {t('employerDashboard.actions.manage')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
