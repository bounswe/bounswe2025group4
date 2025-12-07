import { type ReactNode, useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '@shared/lib/i18n';

type I18nProviderProps = {
  children: ReactNode;
};

function DirectionUpdater() {
  const { i18n: i18next } = useTranslation();

  useEffect(() => {
    const applyDirection = (lng: string) => {
      const language = lng || i18next.language;
      const direction = i18next.dir(language);
      const root = document.documentElement;

      root.setAttribute('lang', language);
      root.setAttribute('dir', direction);

      if (document.body) {
        document.body.dir = direction;
        document.body.classList.toggle('rtl', direction === 'rtl');
      }
    };

    applyDirection(i18next.resolvedLanguage ?? i18next.language);

    i18next.on('languageChanged', applyDirection);

    return () => {
      i18next.off('languageChanged', applyDirection);
    };
  }, [i18next]);

  return null;
}

export function I18nProvider({ children }: I18nProviderProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <DirectionUpdater />
      {children}
    </I18nextProvider>
  );
}
