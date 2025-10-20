import { useTranslation } from 'react-i18next';
import { Briefcase, DollarSign, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type Job, type JobType, type Policy } from '@/types/job';

type JobCardProps = {
  job: Job;
};

function formatSalary(value: number) {
  return `$${value}k`;
}

const policyLabelKeyMap: Record<Policy, string> = {
  'Fair Labor Practices': 'jobFilters.policyOptions.fairLabor',
  'Environmental Sustainability': 'jobFilters.policyOptions.environment',
  'Diversity & Inclusion': 'jobFilters.policyOptions.diversity',
};

const jobTypeLabelKeyMap: Record<JobType, string> = {
  'Full-time': 'jobFilters.jobTypeOptions.fullTime',
  'Part-time': 'jobFilters.jobTypeOptions.partTime',
  'Contract': 'jobFilters.jobTypeOptions.contract',
};

export function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const handleCardClick = () => {
    navigate(`/jobs/${job.id}`);
  };

  const policies = job.policies.map((policy) => t(policyLabelKeyMap[policy] ?? policy));
  const jobTypes = job.type.map((type) => t(jobTypeLabelKeyMap[type] ?? type));
  const location =
    job.location.toLowerCase() === 'remote' ? t('jobCard.remote') : job.location;

  return (
    <Card
      className="group border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex flex-col gap-6 px-4 sm:flex-row sm:items-start">
        <Avatar className="size-20 self-center rounded-md">
          <AvatarImage src={job.logoUrl} alt={`${job.company} logo`} />
          <AvatarFallback className="rounded-md text-sm font-semibold">
            {job.company
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 3)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {policies.map((policy) => (
              <Badge
                key={policy}
                variant="secondary"
                className="border-0 bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                {policy}
              </Badge>
            ))}
          </div>

          {/* Job Title and Company */}
          <div className="flex flex-col gap-1">
            <div className="text-xl font-semibold text-foreground">
              {job.title}
            </div>
            <div className="text-sm text-muted-foreground">{job.company}</div>
          </div>

          {/* Job Types, Salary, Location */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Briefcase className="size-4 text-primary" aria-hidden />
              {jobTypes.join(' / ')}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="size-4 text-primary" aria-hidden />
              {formatSalary(job.minSalary)} - {formatSalary(job.maxSalary)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-4 text-primary" aria-hidden />
              {location}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
