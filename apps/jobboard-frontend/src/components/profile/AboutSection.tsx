import { Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface AboutSectionProps {
  bio?: string;
  onEdit?: () => void;
  isPublicView?: boolean;
}

export function AboutSection({ bio, onEdit, isPublicView = false }: AboutSectionProps) {
  const { t } = useTranslation('common');

  return (
    <section className="space-y-2 group">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('profile.about.title')}</h2>
        {!isPublicView && (
          <Button
            size="icon-sm"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onEdit}
            aria-label={t('profile.about.modal.title')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
      {bio ? (
        <p className="text-muted-foreground leading-relaxed">{bio}</p>
      ) : isPublicView ? (
        <p className="text-muted-foreground leading-relaxed">
          {t('profile.about.noBio')}
        </p>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-6 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer transition-colors"
          onClick={onEdit}
        >
          <Plus className="h-4 w-4" />
          <span>{t('profile.about.addBio')}</span>
        </div>
      )}
    </section>
  );
}
