import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Accessibility, Building2, ChevronRight, DollarSign, Edit, MapPin } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import { cn } from '@shared/lib/utils';
import { normalizeApiError } from '@shared/utils/error-handler';
import { useJobQuery, updateJob } from '@modules/jobs/services/jobs.service';
import { useApplicationsByJobQuery } from '@modules/jobs/applications/services/applications.service';
import { useMyWorkplacesQuery } from '@modules/employer/services/employer.service';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import JobEditModal, { type JobPostFormData } from '@modules/jobs/components/JobEditModal';
import { jobsKeys } from '@shared/lib/query-keys';
import type { JobPostResponse, UpdateJobPostRequest } from '@shared/types/api.types';
import { TAG_TO_KEY_MAP } from '@shared/constants/ethical-tags';
import { StarRating } from '@shared/components/ui/star-rating';

const getEthicalTagTranslationKey = (tag: string): string => {
  return TAG_TO_KEY_MAP[tag as keyof typeof TAG_TO_KEY_MAP] || tag.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
};

const parseContact = (contact: JobPostResponse['contact']) => {
  if (!contact) return { email: '' };
  if (typeof contact === 'string' && contact.startsWith('{')) {
    try {
      const parsed = JSON.parse(contact) as { name?: string; title?: string; email?: string };
      if (parsed.email) return parsed;
    } catch {
      return { email: contact };
    }
  }
  return { email: contact };
};

const formatSalary = (min: number, max: number) => `$${(min / 1000).toFixed(0)},000 - $${(max / 1000).toFixed(0)},000`;

export default function JobDetailPage() {
  const { id, jobId } = useParams<{ id?: string; jobId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';

  const numericJobId = id ? parseInt(id, 10) : jobId ? parseInt(jobId, 10) : undefined;
  const { user } = useAuth();
  const jobQuery = useJobQuery(numericJobId);
  const [jobView, setJobView] = useState<JobPostResponse | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<JobPostFormData>({
    title: '',
    description: '',
    workplaceId: null,
    remote: false,
    minSalary: '',
    maxSalary: '',
    contact: '',
    inclusiveOpportunity: false,
    nonProfit: false,
  });

  const normalizedError = jobQuery.error ? normalizeApiError(jobQuery.error) : null;
  const errorMessage = normalizedError?.friendlyMessage;

  useEffect(() => {
    if (jobQuery.data) {
      setJobView(jobQuery.data);
    }
  }, [jobQuery.data]);

  useEffect(() => {
    if (!jobView) return;
    const contact = parseContact(jobView.contact);
    setFormData({
      title: jobView.title ?? '',
      description: jobView.description ?? '',
      workplaceId: jobView.workplaceId ?? jobView.workplace?.id ?? null,
      remote: jobView.remote ?? false,
      minSalary: jobView.minSalary?.toString() ?? '',
      maxSalary: jobView.maxSalary?.toString() ?? '',
      contact: contact.email ?? jobView.contact ?? '',
      inclusiveOpportunity: jobView.inclusiveOpportunity ?? false,
      nonProfit: jobView.nonProfit ?? false,
    });
  }, [jobView]);

  const myWorkplacesQuery = useMyWorkplacesQuery();
  const isEmployerForWorkplace = useMemo(() => {
    if (!jobView?.workplace?.id) return false;
    return (myWorkplacesQuery.data ?? []).some((wp) => wp.workplace.id === jobView.workplace.id);
  }, [jobView?.workplace?.id, myWorkplacesQuery.data]);

  const isEmployerRole = user?.role === 'ROLE_EMPLOYER';
  const isJobSeeker = user?.role === 'ROLE_JOBSEEKER';
  const canEdit = Boolean(isEmployerRole && isEmployerForWorkplace);
  const showApplyButton = Boolean(isJobSeeker);

  const applicationsQuery = useApplicationsByJobQuery(
    numericJobId,
    Boolean(numericJobId && canEdit),
  );
  const applications = applicationsQuery.data ?? [];

  const breadcrumbFrom = location.state?.from as string | undefined;
  const breadcrumbLink = breadcrumbFrom === 'employer-dashboard' ? '/employer/dashboard' : '/jobs';
  const breadcrumbLabel =
    breadcrumbFrom === 'employer-dashboard'
      ? t('employer.dashboard.title', { defaultValue: 'Dashboard' })
      : t('jobs.detail.breadcrumb.jobs');

  const updateJobMutation = useMutation({
    mutationFn: (payload: UpdateJobPostRequest) => updateJob(numericJobId as number, payload),
    onMutate: async (payload) => {
      if (!numericJobId) return { previous: null as JobPostResponse | null };
      await queryClient.cancelQueries({ queryKey: jobsKeys.detail(numericJobId) });
      const previous = queryClient.getQueryData<JobPostResponse>(jobsKeys.detail(numericJobId));

      const optimistic: JobPostResponse | null =
        previous || jobView
          ? {
              ...(previous || jobView)!,
              title: payload.title ?? (previous || jobView)!.title,
              description: payload.description ?? (previous || jobView)!.description,
              remote: payload.remote ?? (previous || jobView)!.remote,
              minSalary: payload.minSalary ?? (previous || jobView)!.minSalary,
              maxSalary: payload.maxSalary ?? (previous || jobView)!.maxSalary,
              contact: payload.contact ?? (previous || jobView)!.contact,
              inclusiveOpportunity:
                payload.inclusiveOpportunity ?? (previous || jobView)!.inclusiveOpportunity,
              nonProfit: payload.nonProfit ?? (previous || jobView)!.nonProfit,
              workplaceId: payload.workplaceId ?? (previous || jobView)!.workplaceId,
              workplace: payload.workplaceId
                ? {
                    ...(previous || jobView)!.workplace,
                    id: payload.workplaceId,
                  }
                : (previous || jobView)!.workplace,
            }
          : null;

      if (optimistic) {
        setJobView(optimistic);
        queryClient.setQueryData(jobsKeys.detail(numericJobId), optimistic);
      }

      return { previous: previous || null };
    },
    onError: (error, _variables, context) => {
      if (numericJobId && context?.previous) {
        queryClient.setQueryData(jobsKeys.detail(numericJobId), context.previous);
        setJobView(context.previous);
      }
      toast.error(normalizeApiError(error).friendlyMessage);
    },
    onSuccess: (data) => {
      if (numericJobId) {
        queryClient.setQueryData(jobsKeys.detail(numericJobId), data);
        setJobView(data);
      }
      toast.success(t('editJob.updateSuccess', { defaultValue: 'Job updated successfully' }));
      setEditOpen(false);
    },
    onSettled: () => {
      if (numericJobId) {
        queryClient.invalidateQueries({ queryKey: jobsKeys.detail(numericJobId) });
      }
    },
  });

  const mutationError = updateJobMutation.error
    ? normalizeApiError(updateJobMutation.error)
    : null;

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!numericJobId) return;

    const payload: UpdateJobPostRequest = {
      title: formData.title,
      description: formData.description,
      workplaceId: formData.workplaceId ?? undefined,
      remote: formData.remote,
      contact: formData.contact,
      inclusiveOpportunity: formData.inclusiveOpportunity,
      minSalary: formData.nonProfit ? 0 : (formData.minSalary ? parseInt(formData.minSalary, 10) : undefined),
      maxSalary: formData.nonProfit ? 0 : (formData.maxSalary ? parseInt(formData.maxSalary, 10) : undefined),
      nonProfit: formData.nonProfit,
    };

    updateJobMutation.mutate(payload);
  };

  if (jobQuery.isLoading || !jobView) {
    return <CenteredLoader />;
  }

  if (jobQuery.error || !jobView) {
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
          <Link to={breadcrumbLink}>{breadcrumbLabel}</Link>
        </Button>
      </div>
    );
  }

  const contactInfo = parseContact(jobView.contact);
  const ethicalTags = jobView.workplace.ethicalTags ?? [];
  const hasEthicalTags = ethicalTags.length > 0;
  const ethicalAveragesEntries = Object.entries(jobView.workplace.ethicalAverages || {});
  const hasEthicalAverages = ethicalAveragesEntries.length > 0;
  const hasOverallEthicalScore = typeof jobView.workplace.overallAvg === 'number';

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to={breadcrumbLink} className="hover:text-foreground transition-colors">
          {breadcrumbLabel}
        </Link>
        <ChevronRight className={cn('size-4', isRtl && 'rotate-180')} aria-hidden />
        <span className="text-foreground">{jobView.title}</span>
      </nav>

      <div className="mx-auto max-w-4xl">
        <Card className="border border-border bg-card shadow-sm py-6">
          <div className="px-6 lg:px-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground lg:text-4xl">{jobView.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-base text-muted-foreground">
                  <Link
                    to={`/workplace/${jobView.workplace.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {jobView.workplace.companyName}
                  </Link>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" aria-hidden />
                    {jobView.remote ? t('jobs.card.remote') : jobView.location}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="size-4" aria-hidden />
                    {formatSalary(jobView.minSalary, jobView.maxSalary)}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {canEdit && (
                  <>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setEditOpen(true)}
                    >
                      <Edit className="size-4" />
                      {t('employer.jobPostDetails.editJobPost', { defaultValue: 'Edit Job Post' })}
                    </Button>
                    <Button
                      variant="secondary"
                      className="gap-2"
                      onClick={() => navigate(`/employer/jobs/${numericJobId}/applications`)}
                    >
                      {t('applications.list.viewAll', { defaultValue: 'View applications' })} ({applications.length})
                    </Button>
                  </>
                )}
                {showApplyButton && (
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    asChild
                  >
                    <Link to={`/jobs/${numericJobId}/apply`}>{t('jobs.detail.applyNow')}</Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Workplace Information */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                {t('jobs.detail.workplace.title')}
              </h2>
              <Link
                to={`/workplace/${jobView.workplace.id}`}
                className="group block rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background"
              >
                <Card className="border border-border bg-muted/30 shadow-none transition-all duration-200 group-hover:-translate-y-[2px] group-hover:border-primary/50 group-hover:bg-muted/50 group-hover:shadow-md">
                  <div className="space-y-4 px-4">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                          {jobView.workplace.companyName}
                        </p>
                        {jobView.workplace.shortDescription && (
                          <p className="max-w-2xl text-sm text-muted-foreground">
                            {jobView.workplace.shortDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4" aria-hidden />
                        <div className="flex flex-col">
                          <span className="text-xs uppercase text-muted-foreground">
                            {t('jobs.detail.workplace.sector', { defaultValue: 'Sector' })}
                          </span>
                          <span className="text-sm font-medium text-foreground">{jobView.workplace.sector}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4" aria-hidden />
                        <div className="flex flex-col">
                          <span className="text-xs uppercase text-muted-foreground">
                            {t('jobs.detail.workplace.location', { defaultValue: 'Location' })}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {jobView.remote ? t('jobs.card.remote') : jobView.workplace.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </section>

            {/* Job Description */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                {t('jobs.detail.description')}
              </h2>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">{jobView.description}</p>
            </section>

            {/* Ethical Tags & Inclusive Opportunity */}
            <section className="space-y-3">
              <Card className="border border-primary/40 bg-primary/5">
                <div className="space-y-4 px-4">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                        {t('jobs.detail.ethicalPolicy.title')}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {t('jobs.detail.ethicalPolicy.sourceNote', {
                          defaultValue: 'Ethical information for this job comes from the company profile.',
                        })}
                      </p>
                    </div>
                    {hasOverallEthicalScore && (
                      <div className="flex items-center gap-2">
                        <StarRating value={jobView.workplace.overallAvg} readonly size="sm" showValue />
                        <Badge variant="secondary" className="text-xs">
                          {t('jobs.detail.ethicalPolicy.overallScore', { defaultValue: 'Company ethical score' })}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {jobView.inclusiveOpportunity && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <Badge className="flex w-fit items-center gap-1 bg-blue-500 text-sm text-white hover:bg-blue-600">
                        <Accessibility className="size-4" aria-hidden />
                        {t('jobs.detail.inclusiveOpportunity')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {t('jobs.detail.ethicalPolicy.inclusiveNote', {
                          defaultValue: 'This company marks this role as an inclusive opportunity.',
                        })}
                      </span>
                    </div>
                  )}

                  {hasEthicalTags ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        {t('jobs.detail.ethicalPolicy.tagCount', {
                          count: ethicalTags.length,
                          defaultValue: `${ethicalTags.length} ethical policies`,
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ethicalTags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {t(`jobs.tags.tags.${getEthicalTagTranslationKey(tag)}`, tag)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t('jobs.detail.ethicalPolicy.noPolicies', {
                        defaultValue: 'The company has not shared its ethical policies yet.',
                      })}
                    </p>
                  )}

                  {hasEthicalAverages && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        {t('jobs.detail.ethicalPolicy.ratingsTitle', {
                          defaultValue: 'Ethical policy ratings',
                        })}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {ethicalAveragesEntries.map(([policy, score]) => {
                          const safeScore = Number.isFinite(Number(score)) ? Number(score) : 0;

                          return (
                            <div
                              key={policy}
                              className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
                            >
                              <span className="text-sm font-medium">
                                {t(`jobs.tags.tags.${getEthicalTagTranslationKey(policy)}`, policy)}
                              </span>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <StarRating value={safeScore} readonly size="sm" />
                                <span className="font-semibold text-foreground">{safeScore.toFixed(1)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </section>

            {/* Contact Information */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                {t('jobs.detail.contact.title')}
              </h2>
              <div className="mt-2">
                {contactInfo.name && <p className="text-sm font-semibold text-foreground">{contactInfo.name}</p>}
                {contactInfo.title && <p className="mt-0.5 text-xs text-muted-foreground">{contactInfo.title}</p>}
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="mt-1 inline-block text-m text-primary hover:underline"
                >
                  {contactInfo.email}
                </a>
              </div>
            </section>
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl min-w-[50vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('editJob.title', { defaultValue: 'Edit Job Posting' })}</DialogTitle>
            <DialogDescription>
              {t('editJob.subtitle', {
                defaultValue: 'Update the information below to keep your job opportunity current.',
              })}
            </DialogDescription>
          </DialogHeader>
          <JobEditModal
            formData={formData}
            onChange={(partial) => setFormData((prev) => ({ ...prev, ...partial }))}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditOpen(false)}
            error={mutationError?.friendlyMessage}
            isSubmitting={updateJobMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

