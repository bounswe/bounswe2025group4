/**
 * Mock implementation of react-i18next for testing
 *
 * This mock returns translation keys directly instead of loading actual translations.
 * This makes tests faster, language-agnostic, and easier to write.
 *
 * @example
 * // In your component:
 * const { t } = useTranslation();
 * t('home.welcome') // Returns: 'home.welcome' in tests
 *
 * // In your test:
 * expect(screen.getByText('home.welcome')).toBeInTheDocument();
 *
 * @example
 * // Override for a specific test:
 * vi.mock('react-i18next', () => ({
 *   useTranslation: () => ({
 *     t: (key: string) => {
 *       if (key === 'special.key') return 'Custom Translation';
 *       return key;
 *     },
 *     i18n: { language: 'en', changeLanguage: vi.fn() },
 *   }),
 *   Trans: ({ children, i18nKey }: any) => children || i18nKey,
 *   I18nextProvider: ({ children }: any) => children,
 * }));
 */

import { type ReactElement } from 'react';

/**
 * Mock useTranslation hook
 * Returns the translation key directly instead of the translated text
 */
export const useTranslation = () => ({
  t: (key: string) => key,
  i18n: {
    language: 'en',
    changeLanguage: () => Promise.resolve(),
    dir: () => 'ltr',
    on: () => {},
    off: () => {},
  },
  ready: true,
});

/**
 * Mock Trans component
 * Renders children if provided, otherwise renders the i18nKey
 */
export const Trans = ({ children, i18nKey }: { children?: ReactElement | string; i18nKey?: string }) => {
  return children || i18nKey || null;
};

/**
 * Mock I18nextProvider
 * Simply passes through children without wrapping
 */
export const I18nextProvider = ({ children }: { children: ReactElement }) => children;

/**
 * Mock initReactI18next
 * No-op for testing
 */
export const initReactI18next = {
  type: '3rdParty' as const,
  init: () => {},
};

// Default export
export default {
  useTranslation,
  Trans,
  I18nextProvider,
  initReactI18next,
};
