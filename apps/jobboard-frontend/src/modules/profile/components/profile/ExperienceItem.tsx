import { Pencil, Briefcase, Trash2 } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Experience {
  id: number;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

interface ExperienceItemProps {
  experience: Experience;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  isPublicView?: boolean;
}

export function ExperienceItem({ experience, onEdit, onDelete, isPublicView = false }: ExperienceItemProps) {
  const { t, i18n } = useTranslation('common');
  const locale = (i18n.resolvedLanguage ?? i18n.language) || 'en';
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
  });
  const startDate = dateFormatter.format(new Date(experience.startDate));
  const endDate = experience.endDate
    ? dateFormatter.format(new Date(experience.endDate))
    : t('profile.common.present');

  return (
    <div className="bg-muted/30 rounded-lg p-4 group relative">
      {!isPublicView && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onEdit?.(experience.id)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onDelete?.(experience.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex gap-3">
        <div className="mt-1">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">
            {experience.position}, {experience.company}
          </h3>
          <p className="text-sm text-muted-foreground">
            {startDate} - {endDate}
          </p>
          {experience.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {experience.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
