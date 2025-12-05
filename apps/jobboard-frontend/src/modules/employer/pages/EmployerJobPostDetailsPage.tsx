import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Edit } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Avatar, AvatarFallback } from '@shared/components/ui/avatar';
import { getJobById } from '@modules/jobs/services/jobs.service';
import { getApplications } from '@modules/jobs/applications/services/applications.service';
import type { JobPostResponse, JobApplicationResponse } from '@shared/types/api.types';
import CenteredLoader from '@shared/components/common/CenteredLoader';

import { useTranslation } from 'react-i18next';
import { TAG_TO_KEY_MAP } from '@shared/constants/ethical-tags';

// Convert ethical tag names to translation keys
const getEthicalTagTranslationKey = (tag: string): string => {
  return TAG_TO_KEY_MAP[tag as keyof typeof TAG_TO_KEY_MAP] || tag.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
};

export default function EmployerJobPostDetailsPage() {
  const { t } = useTranslation('common');
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [jobPost, setJobPost] = useState<JobPostResponse | null>(null);
  const [applications, setApplications] = useState<JobApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      if (!jobId) return;

      try {
        setIsLoading(true);
        setError(null);

        const jobIdAsInt = parseInt(jobId, 10);

        // Fetch job details and applications in parallel
        const [jobData, applicationsData] = await Promise.all([
          getJobById(jobIdAsInt),
          getApplications({ jobPostId: jobIdAsInt }),
        ]);

        setJobPost(jobData);
        setApplications(applicationsData);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(t('employerJobPostDetails.error.load'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobAndApplications();
  }, [jobId, t]);

  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()} per year`;
  };

  // Format date from ISO string
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('employerJobPostDetails.applied.today');
    if (diffDays === 1) return t('employerJobPostDetails.applied.yesterday');
    return t('employerJobPostDetails.applied.daysAgo', { count: diffDays });
  };

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error || !jobPost) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">
          {error ? t('employerJobPostDetails.error.title') : t('employerJobPostDetails.error.notFound')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {error || t('employerJobPostDetails.error.description')}
        </p>
        <Button asChild className="mt-6">
          <Link to="/employer/dashboard">{t('employerJobPostDetails.backToDashboard')}</Link>
        </Button>
      </div>
    );
  }

  // Parse contact info
  let contactInfo: { name?: string; email?: string } = {};
  try {
    contactInfo = typeof jobPost.contact === 'string' && jobPost.contact.startsWith('{')
      ? JSON.parse(jobPost.contact)
      : { email: jobPost.contact };
  } catch {
    contactInfo = { email: jobPost.contact };
  }

  const ethicalTags = jobPost.workplace.ethicalTags;

  const jobPostId = jobPost.id ?? jobPost.jobPostId ?? jobPost.jobId;

  const handleEditClick = () => {
    if (!jobPostId) return;
    navigate(`/employer/jobs/${jobPostId}/edit`);
  };

  const handleViewApplication = (applicationId: number) => {
    if (!jobPostId) return;
    navigate(`/employer/jobs/${jobPostId}/applications/${applicationId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/employer/dashboard" className="hover:text-foreground transition-colors">
          {t('employerJobPostDetails.breadcrumb.jobs')}
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <span className="text-foreground">{jobPost.title}</span>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl">
        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground lg:text-4xl">{jobPost.title}</h1>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleEditClick}
              >
                <Edit className="size-4" />
                {t('employerJobPostDetails.editJobPost')}
              </Button>
            </div>

            {/* Job Description */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">{t('employerJobPostDetails.jobDescription')}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{jobPost.description}</p>
            </section>

            {/* Salary Range */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">{t('employerJobPostDetails.salaryRange')}</h2>
              <p className="mt-3 text-muted-foreground">
                {formatSalary(jobPost.minSalary, jobPost.maxSalary)}
              </p>
            </section>

            {/* Location */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">{t('employerJobPostDetails.location')}</h2>
              <p className="mt-3 text-muted-foreground">
                {jobPost.remote ? t('employerJobPostDetails.remote') : jobPost.location}
                {jobPost.remote && jobPost.location && ` (${jobPost.location})`}
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                {t('employerJobPostDetails.contact')}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {contactInfo.name && `${contactInfo.name}: `}
                {contactInfo.email}
              </p>
            </section>

            {/* Ethical Tags */}
            {ethicalTags.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground lg:text-2xl">{t('employerJobPostDetails.ethicalPolicies')}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ethicalTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block rounded-md bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {t(`ethicalTags.tags.${getEthicalTagTranslationKey(tag)}`, tag)}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Inclusive Opportunity */}
            {jobPost.inclusiveOpportunity && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                  {t('employerJobPostDetails.inclusiveOpportunity')}
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {t('employerJobPostDetails.inclusiveOpportunityDescription')}
                </p>
              </section>
            )}

            {/* Applications Received */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground lg:text-2xl">
                {t('employerJobPostDetails.applicationsReceived', { count: applications.length })}
              </h2>
              {applications.length === 0 ? (
                <p className="text-muted-foreground">{t('employerJobPostDetails.noApplications')}</p>
              ) : (
                <div className="space-y-3">
                  {applications.map((application) => (
                    <Card key={application.id} className="border border-border bg-background">
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="size-12 rounded-md">
                            <AvatarFallback className="rounded-md text-sm font-semibold">
                              {application.applicantName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{application.applicantName}</p>
                            <p className="text-sm text-muted-foreground">{application.title}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(application.appliedDate)}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleViewApplication(application.id)}
                        >
                          {t('employerJobPostDetails.viewApplication')}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
