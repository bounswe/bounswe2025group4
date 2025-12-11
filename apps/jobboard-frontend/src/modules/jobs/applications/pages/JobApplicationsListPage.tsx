import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  ArrowUpDown,
  Briefcase,
  CalendarClock,
  Download,
  Filter,
  Search,
  Sparkles,
  UserRound,
  Users2,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@shared/components/ui/avatar';
import { Badge } from '@shared/components/ui/badge';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import { normalizeApiError } from '@shared/utils/error-handler';
import { cn } from '@shared/lib/utils';
import { useJobQuery } from '@modules/jobs/services/jobs.service';
import { useApplicationsByJobQuery, getCvUrl } from '@modules/jobs/applications/services/applications.service';
import { useMyWorkplacesQuery } from '@modules/employer/services/employer.service';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import type { JobApplicationStatus } from '@shared/types/api.types';

type FilterOption = 'all' | JobApplicationStatus;
type SortKey = 'date' | 'name';
type SortDirection = 'asc' | 'desc';

const statusVariants: Record<JobApplicationStatus, 'default' | 'success' | 'destructive'> = {
  PENDING: 'default',
  APPROVED: 'success',
  REJECTED: 'destructive',
};

const filterOptions: FilterOption[] = ['all', 'PENDING', 'APPROVED', 'REJECTED'];

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase() || '?';

const StatCard = ({
  label,
  value,
  icon: Icon,
  accentClass,
}: {
  label: string;
  value: number;
  icon: typeof Users2;
  accentClass: string;
}) => (
  <Card className="border border-border p-4 shadow-none">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
      <div className={cn('rounded-full p-3 text-primary', accentClass)}>
        <Icon className="size-5" aria-hidden />
      </div>
    </div>
  </Card>
);

export default function JobApplicationsListPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const numericJobId = jobId ? parseInt(jobId, 10) : undefined;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';

  const [statusFilter, setStatusFilter] = useState<FilterOption>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const jobQuery = useJobQuery(numericJobId, Boolean(numericJobId));
  const myWorkplacesQuery = useMyWorkplacesQuery();

  const canViewApplications = useMemo(() => {
    if (!user || user.role !== 'ROLE_EMPLOYER') return false;
    const workplaceId = jobQuery.data?.workplace?.id;
    if (!workplaceId) return false;
    return (myWorkplacesQuery.data ?? []).some((wp) => wp.workplace.id === workplaceId);
  }, [jobQuery.data?.workplace?.id, myWorkplacesQuery.data, user]);

  const applicationsQuery = useApplicationsByJobQuery(
    numericJobId,
    Boolean(numericJobId && canViewApplications),
  );
  const applications = useMemo(
    () => applicationsQuery.data ?? [],
    [applicationsQuery.data],
  );

  const stats = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter((app) => app.status === 'PENDING').length,
      approved: applications.filter((app) => app.status === 'APPROVED').length,
      rejected: applications.filter((app) => app.status === 'REJECTED').length,
    }),
    [applications],
  );

  const filteredApplications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesSearch =
        term.length === 0 ||
        app.applicantName.toLowerCase().includes(term) ||
        app.coverLetter?.toLowerCase().includes(term) ||
        app.specialNeeds?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [applications, searchTerm, statusFilter]);

  const sortedApplications = useMemo(
    () =>
      [...filteredApplications].sort(
        (a, b) => {
          if (sortKey === 'date') {
            const diff = new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
            return sortDirection === 'asc' ? diff : -diff;
          }
          const compare = a.applicantName.localeCompare(b.applicantName);
          return sortDirection === 'asc' ? compare : -compare;
        },
      ),
    [filteredApplications, sortDirection, sortKey],
  );

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString(resolvedLanguage, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const handleDownloadCv = async (applicationId: number) => {
    try {
      const cvUrl = await getCvUrl(applicationId);
      window.open(cvUrl, '_blank');
    } catch (err) {
      toast.error(normalizeApiError(err).friendlyMessage);
    }
  };

  const handleReview = (applicationId: number) => {
    if (!numericJobId) return;
    navigate(`/employer/jobs/${numericJobId}/applications/${applicationId}`, {
      state: { from: 'applications-list' },
    });
  };

  if (jobQuery.isLoading || myWorkplacesQuery.isLoading) {
    return <CenteredLoader />;
  }

  if (jobQuery.error || !jobQuery.data) {
    const normalized = jobQuery.error ? normalizeApiError(jobQuery.error) : null;
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">
          {t('applications.list.jobErrorTitle', { defaultValue: 'Job not found' })}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {normalized?.friendlyMessage ||
            t('applications.list.jobErrorMessage', { defaultValue: 'We could not load this job post.' })}
        </p>
        <Button asChild className="mt-6">
          <Link to="/employer/dashboard">
            {t('applications.list.backToDashboard', { defaultValue: 'Back to dashboard' })}
          </Link>
        </Button>
      </div>
    );
  }

  if (!canViewApplications) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">
          {t('applications.list.permissionDenied', { defaultValue: 'You cannot view these applications' })}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t('applications.list.permissionHint', {
            defaultValue: 'Only employers of this workplace can see applications for this job.',
          })}
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link to={`/employer/jobs/${numericJobId ?? ''}`}>
            {t('applications.list.backToJob', { defaultValue: 'Back to job post' })}
          </Link>
        </Button>
      </div>
    );
  }

  const applicationsError = applicationsQuery.error
    ? normalizeApiError(applicationsQuery.error).friendlyMessage
    : null;

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <Link to={`/employer/jobs/${numericJobId}`}>
                <Button variant="ghost" size="sm" className="gap-2 px-0">
                  <ArrowLeft className="size-4" aria-hidden />
                  {t('applications.list.back', { defaultValue: 'Back to job post' })}
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
              {t('applications.list.title', {
                defaultValue: 'Applications for {{title}}',
                title: jobQuery.data.title,
              })}
            </h1>
            <p className="text-muted-foreground">
              {t('applications.list.subtitle', {
                defaultValue: 'Review and manage every application in one place.',
              })}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-base text-muted-foreground">
              <Badge variant="outline" className="gap-2">
                <Briefcase className="size-4" aria-hidden />
                {jobQuery.data.workplace.companyName}
              </Badge>
              <Badge variant="secondary" className="gap-2">
                <CalendarClock className="size-4" aria-hidden />
                {t('applications.list.postedOn', {
                  defaultValue: 'Posted',
                })}{' '}
                {formatDate(jobQuery.data.postedDate)}
              </Badge>
              {jobQuery.data.remote && (
                <Badge variant="secondary" className="gap-2">
                  <Sparkles className="size-4" aria-hidden />
                  {t('jobs.card.remote')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label={t('applications.list.stats.total', { defaultValue: 'Total' })}
            value={stats.total}
            icon={Users2}
            accentClass="bg-primary/10"
          />
          <StatCard
            label={t('applications.list.stats.pending', { defaultValue: 'Pending' })}
            value={stats.pending}
            icon={CalendarClock}
            accentClass="bg-amber-100 text-amber-600 dark:bg-amber-900/40"
          />
          <StatCard
            label={t('applications.list.stats.approved', { defaultValue: 'Approved' })}
            value={stats.approved}
            icon={Sparkles}
            accentClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30"
          />
          <StatCard
            label={t('applications.list.stats.rejected', { defaultValue: 'Rejected' })}
            value={stats.rejected}
            icon={Filter}
            accentClass="bg-rose-100 text-rose-700 dark:bg-rose-900/30"
          />
        </div>

        {/* Filters */}
        <Card className="border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center gap-3 md:max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('applications.list.searchPlaceholder', {
                    defaultValue: 'Search by name, cover letter, or needs',
                  })}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowUpDown className="size-4" aria-hidden />
                    {sortKey === 'date'
                      ? sortDirection === 'desc'
                        ? t('applications.list.sort.newest', { defaultValue: 'Newest first' })
                        : t('applications.list.sort.oldest', { defaultValue: 'Oldest first' })
                      : sortDirection === 'asc'
                        ? t('applications.list.sort.nameAsc', { defaultValue: 'Name A-Z' })
                        : t('applications.list.sort.nameDesc', { defaultValue: 'Name Z-A' })}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>
                    {t('applications.list.sort.title', { defaultValue: 'Sort applications' })}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSortKey('date');
                      setSortDirection('desc');
                    }}
                  >
                    {t('applications.list.sort.newest', { defaultValue: 'Newest first' })}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortKey('date');
                      setSortDirection('asc');
                    }}
                  >
                    {t('applications.list.sort.oldest', { defaultValue: 'Oldest first' })}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSortKey('name');
                      setSortDirection('asc');
                    }}
                  >
                    {t('applications.list.sort.nameAsc', { defaultValue: 'Name A-Z' })}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortKey('name');
                      setSortDirection('desc');
                    }}
                  >
                    {t('applications.list.sort.nameDesc', { defaultValue: 'Name Z-A' })}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {filterOptions.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={statusFilter === option ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(option)}
                  className="capitalize"
                >
                  {option === 'all'
                    ? t('applications.mine.filters.all')
                    : t(`applications.mine.applicationCard.status.${option}`)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Applications list */}
        <div className="space-y-4">
          {applicationsQuery.isLoading ? (
            <CenteredLoader />
          ) : sortedApplications.length === 0 ? (
            <Card className="border border-dashed border-border bg-muted/40 p-10 text-center shadow-none">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="size-6" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {t('applications.list.emptyTitle', { defaultValue: 'No applications yet' })}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t('applications.list.emptySubtitle', {
                  defaultValue: 'Share your job post to start receiving applications.',
                })}
              </p>
            </Card>
          ) : (
            sortedApplications.map((application) => (
              <Card
                key={application.id}
                className="border border-border bg-card shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
              >
                <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-1 gap-4">
                    <Avatar className="size-14 rounded-lg border border-border bg-muted">
                      <AvatarFallback className="rounded-lg text-lg font-semibold">
                        {getInitials(application.applicantName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/profile/${application.jobSeekerId}`}
                          className="text-lg font-semibold text-primary hover:underline underline-offset-4"
                        >
                          {application.applicantName}
                        </Link>
                        <Badge variant={statusVariants[application.status]} className="capitalize">
                          {t(`applications.mine.applicationCard.status.${application.status}`)}
                        </Badge>
                        {application.specialNeeds && (
                          <Badge variant="warning" className="gap-1">
                            <Filter className="size-3" aria-hidden />
                            {t('applications.list.hasNeeds', { defaultValue: 'Special needs noted' })}
                          </Badge>
                        )}
                        {application.coverLetter && (
                          <Badge variant="secondary" className="gap-1">
                            <Sparkles className="size-3" aria-hidden />
                            {t('applications.list.hasCoverLetter', { defaultValue: 'Cover letter' })}
                          </Badge>
                        )}
                      </div>
                      <p className="text-base text-muted-foreground">
                        {t('applications.list.appliedOn', {
                          defaultValue: 'Applied on {{date}}',
                          date: formatDate(application.appliedDate),
                        })}
                      </p>
                      {application.coverLetter && (
                        <p className="line-clamp-3 text-base leading-relaxed text-foreground/80">
                          {application.coverLetter}
                        </p>
                      )}
                      {application.specialNeeds && (
                        <div className="rounded-md border border-dashed border-amber-200 bg-amber-50 p-3 text-base text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                          {application.specialNeeds}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end">
                    <Button
                      size="sm"
                      className="w-full md:w-auto"
                      onClick={() => handleReview(application.id)}
                    >
                      {t('applications.list.review', { defaultValue: 'Review application' })}
                    </Button>
                    {application.cvUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full md:w-auto"
                        onClick={() => handleDownloadCv(application.id)}
                      >
                        <Download className="mr-2 size-4" aria-hidden />
                        {t('applications.mine.applicationCard.actions.downloadCV')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}

          {applicationsError && (
            <Card className="border border-destructive/40 bg-destructive/5 p-4 text-base text-destructive">
              {applicationsError}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

