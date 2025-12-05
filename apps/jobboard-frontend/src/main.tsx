import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from './router.tsx';
import './index.css';
import '@shared/lib/i18n';
import { ThemeProvider } from '@shared/providers/ThemeProvider.tsx';
import { AuthProvider } from '@shared/contexts/AuthContext';
import { I18nProvider } from '@shared/providers/I18nProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <Router />
        </ThemeProvider>
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
);
