/**
 * WorkplaceProfilePage
 * Displays workplace details with reviews and allows employers to manage
 */

import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { Input } from '@shared/components/ui/input';
import { Separator } from '@shared/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import { ReviewStats } from '@modules/mentorship/components/reviews/ReviewStats';
import { ReviewList } from '@modules/mentorship/components/reviews/ReviewList';
import { ReviewFormDialog } from '@modules/mentorship/components/reviews/ReviewFormDialog';
import { MapPin, Building2, ExternalLink, Users, Settings, CheckCircle2, ArrowDown, ArrowUp } from 'lucide-react';
import { useWorkplaceQuery } from '@modules/workplace/services/workplace.service';
import { getJobsByEmployer } from '@modules/jobs/services/jobs.service';
import { useEmployerRequestsQuery } from '@modules/employer/services/employer.service';
import { useReportModal } from '@shared/hooks/useReportModal';
import { reportWorkplace } from '@modules/workplace/services/workplace-report.service';
import { Flag } from 'lucide-react';
import type { ReviewListParams } from '@shared/types/workplace.types';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import type { JobPostResponse } from '@shared/types/api.types';
import { translateEthicalTag } from '@shared/utils/ethical-tag-translator';

export default function WorkplaceProfilePage() {
  const { id, workplaceId } = useParams<{ id?: string; workplaceId?: string }>();
  const resolvedId = workplaceId ?? id;
  const { t } = useTranslation('common');
  const resolvedWorkplaceId = resolvedId ? parseInt(resolvedId, 10) : undefined;
  const { isAuthenticated, user } = useAuth();
  const translateRole = (roleLabel: string) =>
    t(`workplace.roles.${roleLabel.toLowerCase()}`, { defaultValue: roleLabel });
  const [refreshKey, setRefreshKey] = useState(0);
  const [reviewSortBy, setReviewSortBy] = useState('ratingDesc');
  const [ratingRange, setRatingRange] = useState<{ min?: number; max?: number }>({});
  const [reviewsTotal, setReviewsTotal] = useState<number>(0);
  const { openReport, ReportModalElement } = useReportModal();

  const {
    data: workplace,
    isLoading: isWorkplaceLoading,
    isError: isWorkplaceError,
    refetch: refetchWorkplace,
  } = useWorkplaceQuery(
    resolvedWorkplaceId,
    { includeReviews: true, reviewsLimit: 5 },
    Boolean(workplaceId),
  );

  const employerIds = useMemo(
    () => workplace?.employers?.map((emp) => emp.userId) ?? [],
    [workplace],
  );

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['workplace-jobs', workplaceId, employerIds],
    queryFn: async () => {
      const allJobsArrays = await Promise.all(
        employerIds.map((employerId) =>
          getJobsByEmployer(employerId).catch((err): JobPostResponse[] => {
            console.error(`Failed to load jobs for employer ${employerId}:`, err);
            return [];
          }),
        ),
      );

      const combinedJobs = allJobsArrays.flat();
      const getJobKey = (job: JobPostResponse) => job.id ?? job.jobId ?? job.jobPostId;

      return combinedJobs.filter((job, index, self) => {
        const key = getJobKey(job);
        return key !== undefined && index === self.findIndex((j) => getJobKey(j) === key);
      });
    },
    enabled: Boolean(workplaceId) && employerIds.length > 0,
  });

  const isEmployerForWorkplace = workplace?.employers?.some((emp) => emp.userId === user?.id);
  const employerRequestsQuery = useEmployerRequestsQuery(
    resolvedWorkplaceId,
    { size: 10 },
    Boolean(resolvedWorkplaceId && isEmployerForWorkplace),
  );
  const hasPendingRequests = Boolean(
    employerRequestsQuery.data?.content?.some(
      (req) => req.status === 'PENDING' || req.status?.toUpperCase() === 'PENDING',
    ),
  );

  const reviewFilters = useMemo(() => {
    const filterParams: Omit<ReviewListParams, 'page' | 'size'> = {};

    if (reviewSortBy) {
      filterParams.sortBy = reviewSortBy;
    }

    const hasMin = ratingRange.min !== undefined;
    const hasMax = ratingRange.max !== undefined;
    if (hasMin || hasMax) {
      const minPart = hasMin ? ratingRange.min ?? 0 : 0;
      const maxPart = hasMax ? ratingRange.max ?? 5 : 5;
      filterParams.ratingFilter = `${minPart},${maxPart}`;
    }

    return filterParams;
  }, [ratingRange, reviewSortBy]);

  const handleReviewSubmitted = () => {
    setRefreshKey((prev) => prev + 1);
    refetchWorkplace();
  };

  const toggleSortDirection = () => {
    setReviewSortBy((prev) => (prev === 'ratingDesc' ? 'ratingAsc' : 'ratingDesc'));
  };

  const employerRole = workplace?.employers?.find((emp) => emp.userId === user?.id)?.role;
  const isOwner = employerRole === 'OWNER';
  // Employers can write reviews for workplaces they don't manage
  const canWriteReview =
    isAuthenticated &&
    (user?.role === 'ROLE_JOBSEEKER' || (user?.role === 'ROLE_EMPLOYER' && !isEmployerForWorkplace));
  const hasRatingFilter = ratingRange.min !== undefined || ratingRange.max !== undefined;

  const handleRatingRangeChange = (bound: 'min' | 'max', value: string) => {
    const parsedValue = value === '' ? undefined : Number.parseFloat(value);

    setRatingRange((prev) => {
      const next = { ...prev };

      if (parsedValue === undefined || Number.isNaN(parsedValue)) {
        delete next[bound];
        return next;
      }

      const clampedValue = Math.min(Math.max(parsedValue, 0), 5);
      next[bound] = clampedValue;
      return next;
    });
  };

  const clearRatingRange = () => setRatingRange({});

  const handleWorkplaceReport = () => {
    if (!workplace) return;
    openReport({
      title: t('workplace.profile.reportWorkplace'),
      subtitle: workplace.companyName,
      onSubmit: async (message, reason) => {
        await reportWorkplace(workplace.id, message, reason);
      },
    });
  };


  if (isWorkplaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (isWorkplaceError || !workplace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('workplace.profile.notFound')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('workplace.profile.notFoundDescription')}
          </p>
          <Link to="/">
            <Button>{t('common.goHome')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workplace Header */}
        <Card className="p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={workplace.imageUrl} alt={workplace.companyName} />
              <AvatarFallback className="text-2xl bg-primary/10">
                <Building2 className="h-12 w-12 text-primary" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{workplace.companyName}</h1>
                  {workplace.shortDescription && (
                    <p className="text-lg text-muted-foreground">{workplace.shortDescription}</p>
                  )}
                </div>
                {isEmployerForWorkplace ? (
                  <Link to={`/employer/workplace/${workplace.id}/settings`}>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                      {t('common.settings')}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={handleWorkplaceReport}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {t('reviews.report')}
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{workplace.sector}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{workplace.location}</span>
                </div>
                {workplace.employers && workplace.employers.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {workplace.employers.length}{' '}
                      {workplace.employers.length === 1 ? t('common.employer') : t('common.employers')}
                    </span>
                  </div>
                )}
              </div>

              {workplace.website && (
                <div className="mt-4">
                  <a
                    href={workplace.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {t('common.visitWebsite')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </Card>
        {ReportModalElement}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {workplace.detailedDescription && (
              <Card className="p-6">
                <h2 className="text-xl font-bold">{t('workplace.profile.aboutCompany')}</h2>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {workplace.detailedDescription}
                </p>
              </Card>
            )}

            {/* Ethical Tags */}
            {workplace.ethicalTags && workplace.ethicalTags.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold">{t('workplace.profile.ethicalCommitments')}</h2>
                <div className="space-y-2">
                  {workplace.ethicalTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-foreground">{translateEthicalTag(t, tag)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Employers Section - visible to everyone */}
            {workplace.employers && workplace.employers.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{t('workplace.profile.employers')}</h2>
                  {isOwner && (
                    <Button variant="outline" asChild className="relative">
                      <Link to={`/employer/workplace/${workplace.id}/requests`}>
                        <Users className="h-4 w-4"/>
                        {t('workplace.profile.manageRequests')}
                        {hasPendingRequests && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background" />
                        )}
                      </Link>
                    </Button>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {workplace.employers.map((employer) => {
                    const initials = employer.nameSurname
                      ? employer.nameSurname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      : employer.username.slice(0, 2).toUpperCase();
                    return (
                      <Link key={employer.userId} to={`/profile/${employer.userId}`}>
                        <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {employer.nameSurname || employer.username}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{employer.email}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {translateRole(employer.role)}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Workplace Reviews */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t('reviews.workplaceReviews')}</h2>
                {canWriteReview && (
                  <ReviewFormDialog
                    workplaceId={workplace.id}
                    workplaceName={workplace.companyName}
                    ethicalTags={workplace.ethicalTags}
                    onReviewSubmitted={handleReviewSubmitted}
                  />
                )}
              </div>

              <ReviewStats
                overallAvg={workplace.overallAvg}
                ethicalAverages={workplace.ethicalAverages}
                ethicalTags={workplace.ethicalTags}
                totalReviews={reviewsTotal || workplace.reviewCount || workplace.recentReviews?.length || 0}
                recentReviews={workplace.recentReviews ?? []}
              />

              <Separator />

              <ReviewList
                workplaceId={workplace.id}
                canReply={isEmployerForWorkplace}
                filters={reviewFilters}
                actions={
                  <>
                    <Button
                      id="review-sort"
                      variant="outline"
                      size="sm"
                      onClick={toggleSortDirection}
                      aria-label={t('reviews.sortBy')}
                    >
                      {reviewSortBy === 'ratingDesc' ? (
                        <ArrowDown className="h-4 w-4" />
                      ) : (
                        <ArrowUp className="h-4 w-4" />
                      )}
                      {t('reviews.sortByRating')}
                    </Button>
                    <Input
                      id="rating-min"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={5}
                      step={0.1}
                      value={ratingRange.min ?? ''}
                      onChange={(e) => handleRatingRangeChange('min', e.target.value)}
                      placeholder={t('reviews.minRating')}
                      className="w-20 h-8 text-sm"
                    />
                    <span className="text-sm text-muted-foreground">-</span>
                    <Input
                      id="rating-max"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={5}
                      step={0.1}
                      value={ratingRange.max ?? ''}
                      onChange={(e) => handleRatingRangeChange('max', e.target.value)}
                      placeholder={t('reviews.maxRating')}
                      className="w-20 h-8 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRatingRange}
                      disabled={!hasRatingFilter}
                      className="h-8 px-2"
                    >
                      {t('reviews.clearFilters')}
                    </Button>
                  </>
                }
                reviewsPerPage={10}
                onTotalsChange={setReviewsTotal}
                key={refreshKey}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Job Openings */}
            <Card className="p-6">
              <h3 className="text-lg font-bold">{t('workplace.profile.currentJobOpenings')}</h3>
              {jobsLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">{t('workplace.profile.noJobOpenings')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.slice(0, 5).map((job) => {
                    const jobId = job.id || job.jobId || job.jobPostId;
                    return (
                      <Link key={jobId} to={`/jobs/${jobId}`} className="block group">
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4 p-4">
                            <Avatar className="h-12 w-12 rounded-md flex-shrink-0">
                              <AvatarImage
                                src={job.workplace?.imageUrl}
                                alt={`${job.workplace?.companyName ?? ''} logo`}
                              />
                              <AvatarFallback className="rounded-md bg-primary/10 text-primary text-sm font-semibold">
                                {job.workplace?.companyName
                                  ?.split(' ')
                                  .map((part) => part[0])
                                  .join('')
                                  .slice(0, 3)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <h4 className="font-semibold group-hover:text-primary transition-colors mb-1">
                                {job.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {job.description}
                              </p>
                              {job.minSalary && job.maxSalary && (
                                <p className="text-sm text-muted-foreground">
                                  ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {jobs.length > 5 && (
                    <Link to="/jobs" className="block">
                      <Button className="w-full" variant="outline" size="sm">
                        {t('workplace.profile.viewAllJobs', { count: jobs.length })}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

