/**
 * WorkplaceProfilePage
 * Displays workplace details with reviews and allows employers to manage
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewFormDialog } from '@/components/reviews/ReviewFormDialog';
import { MapPin, Building2, ExternalLink, Users, Settings } from 'lucide-react';
import { getWorkplaceById } from '@/services/workplace.service';
import type { WorkplaceDetailResponse } from '@/types/workplace.types';
import { useAuth } from '@/contexts/AuthContext';

export default function WorkplaceProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuth();
  const [workplace, setWorkplace] = useState<WorkplaceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadWorkplaceData();
  }, [id, refreshKey]);

  const loadWorkplaceData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await getWorkplaceById(parseInt(id, 10), true, 5);
      setWorkplace(data);
    } catch (error) {
      console.error('Failed to load workplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const canWriteReview = isAuthenticated && user?.role === 'ROLE_JOBSEEKER';
  const isEmployer = workplace?.employers?.some((emp) => emp.userId === user?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!workplace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Workplace not found</h2>
          <p className="text-muted-foreground mb-4">
            The workplace you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button>Go Home</Button>
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
            {/* Logo */}
            <div className="flex-shrink-0">
              {workplace.imageUrl ? (
                <img
                  src={workplace.imageUrl}
                  alt={workplace.companyName}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              ) : (
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl bg-primary/10">
                    <Building2 className="h-12 w-12 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{workplace.companyName}</h1>
                  {workplace.shortDescription && (
                    <p className="text-lg text-muted-foreground">
                      {workplace.shortDescription}
                    </p>
                  )}
                </div>
                {isEmployer && (
                  <Link to={`/employer/workplace/${workplace.id}/settings`}>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
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
                      {workplace.employers.length === 1 ? 'employer' : 'employers'}
                    </span>
                  </div>
                )}
              </div>

              {workplace.ethicalTags && workplace.ethicalTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {workplace.ethicalTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {workplace.website && (
                <div className="mt-4">
                  <a
                    href={workplace.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {workplace.detailedDescription && (
            <>
              <Separator className="my-6" />
              <div>
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {workplace.detailedDescription}
                </p>
              </div>
            </>
          )}

          {/* Employers Section */}
          {isEmployer && workplace.employers && workplace.employers.length > 0 && (
            <>
              <Separator className="my-6" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Employers</h2>
                  <Link to={`/employer/workplace/${workplace.id}/requests`}>
                    <Button variant="outline" size="sm">
                      Manage Requests
                    </Button>
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {workplace.employers.map((employer) => (
                    <Card key={employer.userId} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{employer.username}</p>
                          <p className="text-xs text-muted-foreground">{employer.email}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {employer.role}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Reviews Section */}
        <div className="mb-8">
          <ReviewStats
            overallAvg={workplace.overallAvg}
            ethicalAverages={workplace.ethicalAverages}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Reviews</h2>
          {canWriteReview && (
            <ReviewFormDialog
              workplaceId={workplace.id}
              workplaceName={workplace.companyName}
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}
        </div>

        <ReviewList
          workplaceId={workplace.id}
          canReply={isEmployer}
          reviewsPerPage={10}
        />
      </div>
    </div>
  );
}
