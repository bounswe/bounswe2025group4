import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EducationItem } from './EducationItem';
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

interface EducationSectionProps {
  educations: Education[];
  onAdd?: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  isPublicView?: boolean;
}

export function EducationSection({
  educations,
  onAdd,
  onEdit,
  onDelete,
  isPublicView = false,
}: EducationSectionProps) {
  const { t } = useTranslation('common');

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('profile.education.title')}</h2>
        {!isPublicView && (
          <Button size="sm" variant="ghost" className="gap-2" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            {t('profile.actions.add')}
          </Button>
        )}
      </div>
      {educations.length > 0 ? (
        <div className="space-y-3">
          {educations.map((edu) => (
            <EducationItem 
              key={edu.id} 
              education={edu} 
              onEdit={isPublicView ? undefined : onEdit} 
              onDelete={isPublicView ? undefined : onDelete}
              isPublicView={isPublicView}
            />
          ))}
        </div>
      ) : isPublicView ? (
        <p className="text-muted-foreground text-sm">
          {t('profile.education.noEducation')}
        </p>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-6 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer transition-colors"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          <span>{t('profile.education.empty')}</span>
        </div>
      )}
    </section>
  );
}
