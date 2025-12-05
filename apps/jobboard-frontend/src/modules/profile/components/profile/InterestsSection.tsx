import { Plus, Pencil } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Interest {
  id: number;
  name: string;
}

interface InterestsSectionProps {
  interests: Interest[];
  onAdd?: () => void;
  onEdit?: (id: number) => void;
  isPublicView?: boolean;
}

export function InterestsSection({
  interests,
  onAdd,
  onEdit,
  isPublicView = false,
}: InterestsSectionProps) {
  const { t } = useTranslation('common');

  return (
    <section className="space-y-3 group">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('profile.interests.title')}</h2>
        {!isPublicView && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
            {t('profile.actions.add')}
          </Button>
        )}
      </div>
      {interests.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <div
              key={interest.id}
              className="bg-muted text-foreground px-3 py-1.5 rounded-full text-sm group/interest relative border"
            >
              {interest.name}
              {!isPublicView && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover/interest:opacity-100 transition-opacity bg-muted hover:bg-muted/80"
                  onClick={() => onEdit?.(interest.id)}
                >
                  <Pencil className="h-2.5 w-2.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : isPublicView ? (
        <p className="text-muted-foreground text-sm">
          {t('profile.interests.noInterests')}
        </p>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-6 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer transition-colors"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          <span>{t('profile.interests.empty')}</span>
        </div>
      )}
    </section>
  );
}
