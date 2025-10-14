import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from './router.tsx';
import './index.css';
import { ThemeProvider } from './providers/ThemeProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router />
    </ThemeProvider>
  </StrictMode>,
);
