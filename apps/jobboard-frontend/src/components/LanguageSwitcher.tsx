import { type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/lib/i18n';

type LanguageSwitcherProps = {
  className?: string;
  showLabel?: boolean;
};

const languageConfig: { code: SupportedLanguage; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ar', name: 'العربية' },
];

export function LanguageSwitcher({ className, showLabel = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation('common');

  const languageCode = (i18n.resolvedLanguage ?? i18n.language)?.split('-')[0] as SupportedLanguage;

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = event.target.value as SupportedLanguage;
    if (nextLanguage !== languageCode) {
      void i18n.changeLanguage(nextLanguage);
    }
  };

  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <Globe2 className="size-4 shrink-0" aria-hidden />
      {showLabel && (
        <span className="font-medium text-foreground">{t('languageSwitcher.label')}</span>
      )}
      <label className="sr-only" htmlFor="language-switcher">
        {t('languageSwitcher.label')}
      </label>
      <select
        id="language-switcher"
        className="min-w-[110px] rounded-md border border-input bg-background px-2 py-1 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={languageCode}
        onChange={handleChange}
        aria-label={t('languageSwitcher.label')}
      >
        {languageConfig.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
