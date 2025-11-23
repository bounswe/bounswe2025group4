import { Pencil, GraduationCap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface EducationItemProps {
  education: Education;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  isPublicView?: boolean;
}

export function EducationItem({ education, onEdit, onDelete, isPublicView = false }: EducationItemProps) {
  const { t, i18n } = useTranslation('common');
  const locale = (i18n.resolvedLanguage ?? i18n.language) || 'en';
  const yearFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric' });
  const startYear = yearFormatter.format(new Date(education.startDate));
  const endYear = education.endDate
    ? yearFormatter.format(new Date(education.endDate))
    : t('profile.common.present');

  return (
    <div className="bg-muted/30 rounded-lg p-4 group relative">
      {!isPublicView && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onEdit?.(education.id)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onDelete?.(education.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex gap-3">
        <div className="mt-1">
          <GraduationCap className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">
            {education.degree} in {education.field}, {education.school}
          </h3>
          <p className="text-sm text-muted-foreground">
            {startYear} - {endYear}
          </p>
          {education.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {education.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
