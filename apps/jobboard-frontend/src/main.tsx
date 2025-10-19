import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from './router.tsx';
import './index.css';
import './lib/i18n';
import { ThemeProvider } from './providers/ThemeProvider.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from './providers/I18nProvider';

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
