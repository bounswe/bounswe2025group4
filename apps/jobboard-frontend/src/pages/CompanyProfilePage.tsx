import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewFormDialog } from '@/components/reviews/ReviewFormDialog';
import { CheckCircle2, MapPin, Users, Briefcase } from 'lucide-react';
import { getCompanyBySlug, getCompanyReviewStats } from '@/services/reviews.service';
import type { Company, ReviewStats as ReviewStatsType } from '@/types/review.types';
import { useAuth } from '@/contexts/AuthContext';

export default function CompanyProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadCompanyData();
  }, [slug, refreshKey]);

  const loadCompanyData = async () => {
    if (!slug) return;

    setLoading(true);
    try {
      const [companyData, stats] = await Promise.all([
        getCompanyBySlug(slug),
        getCompanyReviewStats(1), // Using companyId 1 for demo
      ]);

      setCompany(companyData);
      setReviewStats(stats);
    } catch (error) {
      console.error('Failed to load company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const canWriteReview = isAuthenticated && user?.role === 'ROLE_JOBSEEKER';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('company.notFound')}</h2>
          <p className="text-muted-foreground mb-4">{t('company.notFoundDescription')}</p>
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
        {/* Company Header */}
        <Card className="p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={company.logo} alt={company.name} />
              <AvatarFallback className="text-2xl">
                {company.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">{company.tagline}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{company.employeeCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{company.industry}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{company.location}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Us */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('company.aboutUs')}</h2>
              <p className="text-foreground leading-relaxed">{company.aboutUs}</p>
            </Card>

            {/* Ethical Policy Commitments */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {t('company.ethicalPolicyCommitments')}
              </h2>
              <div className="space-y-3">
                {company.ethicalCommitments.map((commitment) => (
                  <div key={commitment.id} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-foreground">{commitment.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Workplace Reviews */}
            {reviewStats && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{t('reviews.workplaceReviews')}</h2>
                  {canWriteReview && (
                    <ReviewFormDialog
                      companyId={company.id}
                      companyName={company.name}
                      onReviewSubmitted={handleReviewSubmitted}
                    />
                  )}
                </div>

                <ReviewStats stats={reviewStats} />

                <Separator />

                <ReviewList companyId={company.id} key={refreshKey} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Job Openings */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">{t('company.currentJobOpenings')}</h3>
              <div className="space-y-4">
                {company.jobOpenings.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="block group"
                  >
                    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img
                        src={job.image}
                        alt={job.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <Badge className="mb-2 bg-green-100 text-green-800 hover:bg-green-100">
                          {job.department}
                        </Badge>
                        <h4 className="font-semibold group-hover:text-primary transition-colors mb-1">
                          {job.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{job.location}</p>
                        <Button className="w-full mt-3" size="sm" variant="outline">
                          {t('company.viewJob')}
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
