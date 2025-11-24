import { useTranslation } from 'react-i18next';
import { MapPin, Heart, Accessibility } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type Job } from '@/types/job';
import { TAG_TO_KEY_MAP } from '@/constants/ethical-tags';

type NonProfitJobCardProps = {
  job: Job;
};

export function NonProfitJobCard({ job }: NonProfitJobCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const handleCardClick = () => {
    navigate(`/nonprofit-jobs/${job.id}`);
  };

  const ethicalTagLabels = job.workplace.ethicalTags
    .filter((tag) => TAG_TO_KEY_MAP[tag as keyof typeof TAG_TO_KEY_MAP])
    .map((tag) => t(`ethicalTags.tags.${TAG_TO_KEY_MAP[tag as keyof typeof TAG_TO_KEY_MAP]}`, tag));
  
  // Handle location display with fallbacks
  const location = job.location?.toLowerCase() === 'remote' 
    ? t('jobCard.remote') 
    : job.location || job.workplace.location || t('jobCard.notSpecified');

  return (
    <Card
      className="group border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex flex-col gap-6 px-6 py-6 sm:flex-row sm:items-start">
        <Avatar className="size-16 self-center rounded-md">
          <AvatarImage src={job.logoUrl} alt={`${job.workplace.companyName} logo`} />
          <AvatarFallback className="rounded-md text-sm font-semibold bg-green-100 text-green-700">
            {job.workplace.companyName
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 3)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="border-0 bg-green-500 text-xs font-medium text-white hover:bg-green-600 flex items-center gap-1"
            >
              <Heart className="size-3" aria-hidden />
              {t('nonProfitJobs.volunteerOpportunity')}
            </Badge>
            {job.inclusiveOpportunity && (
              <Badge
                variant="secondary"
                className="border-0 bg-blue-500 text-xs font-medium text-white hover:bg-blue-600 flex items-center gap-1"
              >
                <Accessibility className="size-3" aria-hidden />
                {t('jobCard.inclusiveOpportunity')}
              </Badge>
            )}
            {ethicalTagLabels.slice(0, 2).map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="border-0 bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                {tag}
              </Badge>
            ))}
            {ethicalTagLabels.length > 2 && (
              <Badge
                variant="secondary"
                className="border-0 bg-muted text-xs font-medium text-muted-foreground"
              >
                +{ethicalTagLabels.length - 2}
              </Badge>
            )}
          </div>

          {/* Job Title and Organization */}
          <div className="flex flex-col gap-2">
            <div className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {job.title}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium">{job.workplace.companyName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="size-4 text-green-500" aria-hidden />
                <span>{location}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {job.description || 
              t('nonProfitJobs.defaultDescription', 'Make a meaningful impact through volunteer work that contributes to environmental sustainability, community development, and social justice initiatives.')
            }
          </div>

          {/* Impact Focus */}
          <div className="flex items-center gap-1 text-sm">
            <span className="text-green-600 font-medium">
              {t('nonProfitJobs.makingADifference')}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
