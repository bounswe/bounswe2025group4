import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Skill {
  id: number;
  name: string;
  level?: string;
}

interface SkillsSectionProps {
  skills: Skill[];
  onAdd?: () => void;
  onEdit?: (id: number) => void;
}

export function SkillsSection({ skills, onAdd, onEdit }: SkillsSectionProps) {
  const { t } = useTranslation('common');

  return (
    <section className="space-y-3 group">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('profile.skills.title')}</h2>
        <Button
          size="sm"
          variant="ghost"
          className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          {t('profile.actions.add')}
        </Button>
      </div>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="bg-muted text-foreground px-3 py-1.5 rounded-full text-sm group/skill relative border"
            >
              {skill.name}
              <Button
                size="icon-sm"
                variant="ghost"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover/skill:opacity-100 transition-opacity bg-muted hover:bg-muted/80"
                onClick={() => onEdit?.(skill.id)}
              >
                <Pencil className="h-2.5 w-2.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-6 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer transition-colors"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          <span>{t('profile.skills.empty')}</span>
        </div>
      )}
    </section>
  );
}
