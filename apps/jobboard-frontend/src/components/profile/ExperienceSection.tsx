import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExperienceItem } from './ExperienceItem';
import { useTranslation } from 'react-i18next';

interface Experience {
  id: number;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

interface ExperienceSectionProps {
  experiences: Experience[];
  onAdd?: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  isPublicView?: boolean;
}

export function ExperienceSection({
  experiences,
  onAdd,
  onEdit,
  onDelete,
  isPublicView = false,
}: ExperienceSectionProps) {
  const { t } = useTranslation('common');

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('profile.experience.title')}</h2>
        {!isPublicView && (
          <Button size="sm" variant="ghost" className="gap-2" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            {t('profile.actions.add')}
          </Button>
        )}
      </div>
      {experiences.length > 0 ? (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <ExperienceItem 
              key={exp.id} 
              experience={exp} 
              onEdit={isPublicView ? undefined : onEdit} 
              onDelete={isPublicView ? undefined : onDelete} 
              isPublicView={isPublicView}
            />
          ))}
        </div>
      ) : isPublicView ? (
        <p className="text-muted-foreground text-sm">
          {t('profile.experience.noExperience')}
        </p>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-6 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer transition-colors"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          <span>{t('profile.experience.empty')}</span>
        </div>
      )}
    </section>
  );
}
