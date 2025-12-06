import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp, Building2, Plus, UserPlus, MapPin, Star, Briefcase } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Badge } from '@shared/components/ui/badge';
import { Card } from '@shared/components/ui/card';
import { CreateJobPostModal } from '@modules/jobs/components/jobs/CreateJobPostModal';
import { getJobsByEmployer } from '@modules/jobs/services/jobs.service';
import { getApplications } from '@modules/jobs/applications/services/applications.service';
import { getMyWorkplaces } from '@modules/employer/services/employer.service';
import { CreateWorkplaceModal } from '@/modules/workplace/components/CreateWorkplaceModal';
import { JoinWorkplaceModal } from '@/modules/workplace/components/JoinWorkplaceModal';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import { useAuthStore } from '@shared/stores/authStore';
import type { JobPostResponse } from '@shared/types/api.types';
import type { EmployerWorkplaceBrief, WorkplaceBriefResponse } from '@shared/types/workplace.types';

type JobPosting = {
  id: number;
  title: string;
  status: string;
  applications: number;
  workplaceId: number | undefined;
  workplace?: WorkplaceBriefResponse;
};

type WorkplaceWithJobs = {
  workplace: WorkplaceBriefResponse;
  role: string;
  jobs: JobPosting[];
  isExpanded: boolean;
};

export default function EmployerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [workplacesWithJobs, setWorkplacesWithJobs] = useState<WorkplaceWithJobs[]>([]);
  const [employerWorkplaces, setEmployerWorkplaces] = useState<EmployerWorkplaceBrief[]>([]);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';

  const fetchData = useCallback(async () => {
    if (!user) {
      setError('auth');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [workplaces, jobs] = await Promise.all([
        getMyWorkplaces(),
        getJobsByEmployer(user.id),
      ]);

      setEmployerWorkplaces(workplaces);

      const getNormalizedJobId = (job: JobPostResponse) =>
        job.id ?? job.jobPostId ?? job.jobId;

      const jobsWithCounts = await Promise.all(
        jobs.map(async (job) => {
          const normalizedId = getNormalizedJobId(job);
          if (normalizedId === undefined) {
            return null;
          }

          try {
            const applications = await getApplications({ jobPostId: normalizedId });
            return {
              id: normalizedId,
              title: job.title,
              status: 'OPEN',
              applications: applications.length,
              workplaceId: job.workplaceId,
              workplace: job.workplace,
            };
          } catch {
            return {
              id: normalizedId,
              title: job.title,
              status: 'OPEN',
              applications: 0,
              workplaceId: job.workplaceId,
              workplace: job.workplace,
            };
          }
        })
      );

      const validJobs = jobsWithCounts.filter((job): job is JobPosting & { workplace: WorkplaceBriefResponse } => 
        job !== null && job.workplace !== undefined
      );
      
      // Get all workplace IDs that the employer belongs to
      const employerWorkplaceIds = new Set(workplaces.map((wp) => wp.workplace.id));
      
      const workplacesData: WorkplaceWithJobs[] = workplaces.map((wp: EmployerWorkplaceBrief) => ({
        workplace: wp.workplace,
        role: wp.role,
        // Match by workplace.id (from the workplace object) as the primary source of truth
        jobs: validJobs.filter((job) => job.workplace.id === wp.workplace.id),
        isExpanded: true,
      }));

      // Jobs are unassigned if their workplace.id doesn't match any employer workplace
      const unassignedJobs = validJobs.filter((job) => 
        !employerWorkplaceIds.has(job.workplace.id)
      );
      if (unassignedJobs.length > 0) {
        workplacesData.push({
          workplace: {
            id: -1,
            companyName: t('employer.dashboard.unassignedJobs'),
            sector: '',
            location: '',
            overallAvg: 0,
            ethicalTags: [],
            ethicalAverages: {},
          },
          role: 'OWNER',
          jobs: unassignedJobs,
          isExpanded: true,
        });
      }

      setWorkplacesWithJobs(workplacesData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('fetch_error');
    } finally {
      setIsLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleWorkplaceExpand = (workplaceId: number) => {
    setWorkplacesWithJobs((prev) =>
      prev.map((wp) =>
        wp.workplace.id === workplaceId ? { ...wp, isExpanded: !wp.isExpanded } : wp
      )
    );
  };

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
    return t(`employer.dashboard.statusLabels.${key}`, { defaultValue: status });
  };

  const getErrorMessage = () => {
    if (error === 'auth') {
      return t('auth.login.errors.generic');
    }
    return t('employer.dashboard.loadingError');
  };

  const handleWorkplaceCreated = () => {
    toast.success(t('workplace.createModal.workplaceCreatedMessage'));
  };

  const handleJoinSuccess = () => {
    setShowJoinModal(false);
    toast.success(t('workplace.joinModal.requestSubmittedMessage', {
      company: 'the workplace', // Generic message since we don't have the specific workplace name here
    }));
    window.location.reload();
  };

  const handleCreateModalOpenChange = (open: boolean) => {
    setShowCreateJobModal(open);
    if (!open) {
      setSelectedWorkplaceId(null);
    }
  };

  const handleOpenCreateJob = (workplaceId?: number) => {
    setSelectedWorkplaceId(workplaceId ?? null);
    setShowCreateJobModal(true);
  };

  const handleJobCreated = async () => {
    handleCreateModalOpenChange(false);
    toast.success(t('employer.createJob.submitSuccess'));
    await fetchData();
  };

  const selectedWorkplace =
    selectedWorkplaceId !== null
      ? employerWorkplaces.find((wp) => wp.workplace.id === selectedWorkplaceId) ?? null
      : null;

  const totalJobs = workplacesWithJobs.reduce((sum, wp) => sum + wp.jobs.length, 0);
  const hasWorkplaces = employerWorkplaces.length > 0;

  if (isLoading) {
    return <CenteredLoader />;
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col gap-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('employer.dashboard.title')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t('employer.dashboard.subtitle', {
                  defaultValue: t('employer.dashboard.currentPostings'),
                })}
              </p>
            </div>
            <div className="flex gap-2">
              {hasWorkplaces && (
                <Button
                  onClick={() => handleOpenCreateJob()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t('employer.dashboard.createJob')}
                </Button>
              )}
            </div>
          </div>
        </header>

        {error ? (
          <Card className="border border-border bg-card shadow-sm">
            <div className="p-6 py-12 text-center">
              <p className="text-destructive mb-4">{getErrorMessage()}</p>
              <Button onClick={() => fetchData()}>
                {t('jobs.retry')}
              </Button>
            </div>
          </Card>
        ) : !hasWorkplaces && totalJobs === 0 ? (
          // No workplaces state
          <Card className="border border-border bg-card shadow-sm">
            <div className="p-8 text-center">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {t('employer.dashboard.noWorkplaces.title')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('employer.dashboard.noWorkplaces.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('employer.dashboard.noWorkplaces.createWorkplace')}
                </Button>
                <Button variant="outline" onClick={() => setShowJoinModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('employer.dashboard.noWorkplaces.joinWorkplace')}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          // Grouped workplaces view
          <div className="space-y-6">
            {/* Workplace action buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('employer.dashboard.addWorkplace')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowJoinModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                {t('employer.dashboard.joinWorkplace')}
              </Button>
            </div>

            {workplacesWithJobs.map((wp) => (
              <Card key={wp.workplace.id} className="border border-border bg-card shadow-sm overflow-hidden p-0 gap-0">
                {/* Workplace Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleWorkplaceExpand(wp.workplace.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {wp.workplace.imageUrl ? (
                        <img
                          src={wp.workplace.imageUrl}
                          alt={wp.workplace.companyName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{wp.workplace.companyName}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {wp.workplace.sector && (
                            <span>{wp.workplace.sector}</span>
                          )}
                          {wp.workplace.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {wp.workplace.location}
                            </span>
                          )}
                          {wp.workplace.overallAvg > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {wp.workplace.overallAvg.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        <span>
                          {wp.jobs.length} {t('employer.dashboard.jobCount', { count: wp.jobs.length })}
                        </span>
                      </div>
                      {wp.isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Jobs List (collapsible) */}
                {wp.isExpanded && (
                  <div className="border-t border-border">
                    {wp.jobs.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-muted-foreground mb-4">
                          {t('employer.dashboard.noJobsInWorkplace')}
                        </p>
                        {wp.workplace.id !== -1 && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCreateJob(wp.workplace.id);
                            }}
                          >
                            {t('employer.dashboard.createJobForWorkplace')}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                {t('employer.dashboard.table.jobTitle')}
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                {t('employer.dashboard.table.status')}
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                {t('employer.dashboard.table.applications')}
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                {t('employer.dashboard.table.actions')}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {wp.jobs.map((job) => (
                              <tr key={job.id} className="border-b last:border-0 hover:bg-muted/20">
                                <td className="px-4 py-4 text-sm text-foreground">
                                  <div className="font-semibold">{job.title}</div>
                                </td>
                                <td className="px-4 py-4">
                                  <Badge variant={getStatusBadgeVariant(job.status)}>
                                    {getStatusLabel(job.status)}
                                  </Badge>
                                </td>
                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                  {job.applications}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/employer/jobs/${job.id}`);
                                      }}
                                    >
                                      {t('employer.dashboard.actions.manage')}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {/* Create job button for this workplace */}
                    {wp.workplace.id !== -1 && wp.jobs.length > 0 && (
                      <div className="p-4 border-t border-border bg-muted/20">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCreateJob(wp.workplace.id);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t('employer.dashboard.createJob')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateJobPostModal
        open={showCreateJobModal}
        onOpenChange={handleCreateModalOpenChange}
        onSuccess={handleJobCreated}
        initialWorkplace={selectedWorkplace}
      />
      <CreateWorkplaceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleWorkplaceCreated}
      />
      <JoinWorkplaceModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
}

