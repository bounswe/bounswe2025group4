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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewFormDialog } from '@/components/reviews/ReviewFormDialog';
import { MapPin, Building2, ExternalLink, Users, Settings, CheckCircle2 } from 'lucide-react';
import { getWorkplaceById } from '@/services/workplace.service';
import { getJobsByEmployer } from '@/services/jobs.service';
import type { WorkplaceDetailResponse } from '@/types/workplace.types';
import type { JobPostResponse } from '@/types/api.types';
import { useAuth } from '@/contexts/AuthContext';

export default function WorkplaceProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuth();
  const [workplace, setWorkplace] = useState<WorkplaceDetailResponse | null>(null);
  const [jobs, setJobs] = useState<JobPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadWorkplaceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, refreshKey]);

  const loadWorkplaceData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await getWorkplaceById(parseInt(id, 10), true, 5);
      setWorkplace(data);
      
      // Load jobs for all employers in the workplace
      if (data.employers && data.employers.length > 0) {
        loadWorkplaceJobs(data.employers.map(emp => emp.userId));
      }
    } catch (error) {
      console.error('Failed to load workplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkplaceJobs = async (employerIds: number[]) => {
    setJobsLoading(true);
    try {
      // Fetch jobs for all employers and combine them
      const allJobsPromises = employerIds.map(employerId => 
        getJobsByEmployer(employerId).catch(err => {
          console.error(`Failed to load jobs for employer ${employerId}:`, err);
          return [];
        })
      );
      
      const allJobsArrays = await Promise.all(allJobsPromises);
      const combinedJobs = allJobsArrays.flat();
      
      // Remove duplicates based on job ID
      const uniqueJobs = combinedJobs.filter((job, index, self) =>
        index === self.findIndex(j => (j.id || j.jobId || j.jobPostId) === (job.id || job.jobId || job.jobPostId))
      );
      
      setJobs(uniqueJobs);
    } catch (error) {
      console.error('Failed to load workplace jobs:', error);
      setJobs([]);
    } finally {
      setJobsLoading(false);
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
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {workplace.detailedDescription && (
              <Card className="p-6">
                <h2 className="text-xl font-bold">About</h2>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {workplace.detailedDescription}
                </p>
              </Card>
            )}

            {/* Ethical Tags */}
            {workplace.ethicalTags && workplace.ethicalTags.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold">Ethical Commitments</h2>
                <div className="space-y-2">
                  {workplace.ethicalTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-foreground">{tag}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Employers Section */}
            {isEmployer && workplace.employers && workplace.employers.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Employers</h2>
                  <Link to={`/employer/workplace/${workplace.id}/requests`}>
                    <Button variant="outline" size="sm">
                      Manage Requests
                    </Button>
                  </Link>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {workplace.employers.map((employer) => (
                    <Link key={employer.userId} to={`/profile/${employer.userId}`}>
                      <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                        <div>
                          <p className="font-medium text-sm">{employer.username}</p>
                          <p className="text-xs text-muted-foreground">{employer.email}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {employer.role}
                          </Badge>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Workplace Reviews */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Reviews</h2>
                {canWriteReview && (
                  <ReviewFormDialog
                    workplaceId={workplace.id}
                    workplaceName={workplace.companyName}
                    onReviewSubmitted={handleReviewSubmitted}
                  />
                )}
              </div>

              <ReviewStats
                overallAvg={workplace.overallAvg}
                ethicalAverages={workplace.ethicalAverages}
                ethicalTags={workplace.ethicalTags}
              />

              <Separator />

              <ReviewList
                workplaceId={workplace.id}
                canReply={isEmployer}
                reviewsPerPage={10}
                key={refreshKey}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Job Openings */}
            <Card className="p-6">
              <h3 className="text-lg font-bold">Current Job Openings</h3>
              {jobsLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No job openings at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.slice(0, 5).map((job) => {
                    const jobId = job.id || job.jobId || job.jobPostId;
                    return (
                      <Link
                        key={jobId}
                        to={`/jobs/${jobId}`}
                        className="block group"
                      >
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="p-4">
                            <Badge className="mb-2 bg-green-100 text-green-800 hover:bg-green-100">
                              {job.company}
                            </Badge>
                            <h4 className="font-semibold group-hover:text-primary transition-colors mb-1">
                              {job.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3 w-3" />
                              <span>{job.location}</span>
                              {job.remote && (
                                <>
                                  <span>•</span>
                                  <span>Remote</span>
                                </>
                              )}
                            </div>
                            {job.minSalary && job.maxSalary && (
                              <p className="text-sm text-muted-foreground mb-2">
                                ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}
                              </p>
                            )}
                            <Button className="w-full mt-3" size="sm" variant="outline">
                              View Job
                            </Button>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {jobs.length > 5 && (
                    <Link to="/jobs" className="block">
                      <Button className="w-full" variant="outline" size="sm">
                        View All Jobs ({jobs.length})
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
