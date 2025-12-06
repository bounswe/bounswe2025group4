import { useTranslation } from 'react-i18next';
import { Briefcase, DollarSign, MapPin, Accessibility } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@shared/components/ui/badge';
import { Card } from '@shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import { type Job, type JobType } from '@shared/types/job';
import { TAG_TO_KEY_MAP } from '@shared/constants/ethical-tags';

type JobCardProps = {
  job: Job;
};

function formatSalary(value: number) {
  return `$${value}k`;
}

const jobTypeLabelKeyMap: Record<JobType, string> = {
  'Full-time': 'jobs.filters.jobTypeOptions.fullTime',
  'Part-time': 'jobs.filters.jobTypeOptions.partTime',
  'Contract': 'jobs.filters.jobTypeOptions.contract',
};

export function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const handleCardClick = () => {
    // Prevent navigation if clicking on workplace link (if we add one inside)
    // For now, the whole card navigates to job detail
    navigate(`/jobs/${job.id}`);
  };

  const handleWorkplaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/workplace/${job.workplace.id}`);
  };

  const ethicalTagLabels = job.workplace.ethicalTags.map((tag) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const key = (TAG_TO_KEY_MAP as any)[tag];
    return t(`jobs.tags.tags.${key ?? tag}`, tag);
  });
  const jobTypes = job.type.map((type) => t(jobTypeLabelKeyMap[type] ?? type));
  const location =
    job.location.toLowerCase() === 'remote' ? t('jobs.card.remote') : job.location;

  return (
    <Card
      className="group border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex flex-col gap-6 px-4 sm:flex-row sm:items-start">
        <div 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleWorkplaceClick}
        >
          <Avatar className="size-20 self-center rounded-md">
            <AvatarImage src={job.workplace.imageUrl} alt={`${job.workplace.companyName} logo`} />
            <AvatarFallback className="rounded-md text-sm font-semibold">
              {job.workplace.companyName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 3)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {job.inclusiveOpportunity && (
              <Badge
                variant="secondary"
                className="border-0 bg-blue-500 text-xs font-medium text-white hover:bg-blue-600 flex items-center gap-1"
              >
                <Accessibility className="size-3" aria-hidden />
                {t('jobs.card.inclusiveOpportunity')}
              </Badge>
            )}
            {ethicalTagLabels.slice(0, 3).map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="border-0 bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                {tag}
              </Badge>
            ))}
            {ethicalTagLabels.length > 3 && (
              <Badge
                variant="secondary"
                className="border-0 bg-muted text-xs font-medium text-muted-foreground"
              >
                +{ethicalTagLabels.length - 3}
              </Badge>
            )}
          </div>

          {/* Job Title and Company */}
          <div className="flex flex-col gap-1">
            <div className="text-xl font-semibold text-foreground">
              {job.title}
            </div>
            <div 
              className="text-sm text-muted-foreground hover:text-primary hover:underline cursor-pointer w-fit"
              onClick={handleWorkplaceClick}
            >
              {job.workplace.companyName}
            </div>
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

