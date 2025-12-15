import type { RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import CenteredLoader from '@shared/components/common/CenteredLoader';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

export const infoRoutes: RouteObject[] = [
  {
    path: '/about',
    element: (
      <Suspense fallback={<CenteredLoader />}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    path: '/contact',
    element: (
      <Suspense fallback={<CenteredLoader />}>
        <ContactPage />
      </Suspense>
    ),
  },
  {
    path: '/privacy',
    element: (
      <Suspense fallback={<CenteredLoader />}>
        <PrivacyPage />
      </Suspense>
    ),
  },
  {
    path: '/terms',
    element: (
      <Suspense fallback={<CenteredLoader />}>
        <TermsPage />
      </Suspense>
    ),
  },
];

