import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const supportedLngs = ['en', 'tr', 'ar'] as const;

const basePath = import.meta.env.BASE_URL || '/';

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      // Use Vite base path so assets load under non-root deployments
      loadPath: `${basePath}locales/{{lng}}/{{ns}}.json`,
    },
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      caches: ['localStorage'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: true,
    },
    returnNull: false,
  });

type SupportedLanguage = (typeof supportedLngs)[number];

export type { SupportedLanguage };

export default i18n;
