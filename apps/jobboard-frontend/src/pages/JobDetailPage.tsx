import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, MapPin, DollarSign, Accessibility, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/ui/star-rating';
import CenteredLoader from '@/components/CenteredLoader';
import type { JobPostResponse } from '@/types/api.types';
import type { Review, ReviewStats } from '@/types/review.types';
import { getJobById } from '@/services/jobs.service';
import { getCompanyReviews, getCompanyReviewStats } from '@/services/reviews.service';
import { cn } from '@/lib/utils';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobPostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
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

        // Fetch company reviews (using mock company id 1 for demo)
        const [stats, reviews] = await Promise.all([
          getCompanyReviewStats(1),
          getCompanyReviews(1, 1, 3),
        ]);
        setReviewStats(stats);
        setRecentReviews(reviews);
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
                    {job.remote ? t('jobCard.remote') : job.location}
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
            {(job.ethicalTags || job.inclusiveOpportunity) && (
              <section className="mt-8">
                <div className="rounded-lg bg-primary/10 p-6">
                  <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                    {t('jobDetail.ethicalPolicy.title')}
                  </h2>

                  {/* Inclusive Opportunity Badge */}
                  {job.inclusiveOpportunity && (
                    <div className="mt-3">
                      <Badge className="bg-blue-500 text-white hover:bg-blue-600 text-sm flex items-center gap-1 w-fit">
                        <Accessibility className="size-4" aria-hidden />
                        {t('jobDetail.inclusiveOpportunity')}
                      </Badge>
                    </div>
                  )}

                  {/* Ethical Tags */}
                  {job.ethicalTags && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.ethicalTags.split(',').map((tag, index) => (
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

            {/* Company Reviews Section */}
            {reviewStats && reviewStats.totalReviews > 0 && (
              <>
                <Separator className="my-8" />
                <section className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                        {t('reviews.aboutCompany', { company: job.company })}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('reviews.seeWhatEmployeesSay')}
                      </p>
                    </div>
                    <Link to="/company/ecotech-solutions">
                      <Button variant="outline">
                        {t('reviews.viewAllReviews')}
                      </Button>
                    </Link>
                  </div>

                  {/* Average Rating Card */}
                  <div className="bg-primary/5 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-foreground mb-2">
                          {reviewStats.averageRating.toFixed(1)}
                        </div>
                        <StarRating value={reviewStats.averageRating} readonly size="md" />
                        <p className="text-sm text-muted-foreground mt-2">
                          {t('reviews.basedOn', { count: reviewStats.totalReviews })}
                        </p>
                      </div>
                      <Separator orientation="vertical" className="h-20" />
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {t('reviews.categories.culture')}
                          </p>
                          <StarRating value={reviewStats.categoryAverages.culture} readonly size="sm" showValue />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {t('reviews.categories.benefits')}
                          </p>
                          <StarRating value={reviewStats.categoryAverages.benefits} readonly size="sm" showValue />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {t('reviews.categories.workLifeBalance')}
                          </p>
                          <StarRating value={reviewStats.categoryAverages.workLifeBalance} readonly size="sm" showValue />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {t('reviews.categories.management')}
                          </p>
                          <StarRating value={reviewStats.categoryAverages.management} readonly size="sm" showValue />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Reviews Preview */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">{t('reviews.recentReviews')}</h3>
                    {recentReviews.map((review) => (
                      <Card key={review.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {review.username === 'Anonymous'
                                ? t('reviews.anonymous')
                                : review.username}
                            </p>
                            <StarRating value={review.overallRating} readonly size="sm" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {review.comment}
                        </p>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Link to="/company/ecotech-solutions">
                      <Button variant="outline" className="w-full sm:w-auto">
                        {t('reviews.seeAllReviews')} ({reviewStats.totalReviews})
                      </Button>
                    </Link>
                  </div>
                </section>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
