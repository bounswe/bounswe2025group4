import React, { type ReactNode } from 'react';

export const useTranslation = () => ({
  t: (key: string) => key,
  i18n: {
    changeLanguage: () => Promise.resolve(),
    language: 'en',
  },
});

export const Trans = ({ children }: { children: ReactNode }) => React.createElement(React.Fragment, null, children);

export const I18nextProvider = ({ children }: { children: ReactNode }) => React.createElement(React.Fragment, null, children);
