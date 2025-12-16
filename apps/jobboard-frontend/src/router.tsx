import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { featureRoutes } from './modules/routes';
import RootLayout from '@shared/layouts/RootLayout';
import ErrorBoundary from '@shared/components/common/ErrorBoundary';
import CenteredLoader from '@shared/components/common/CenteredLoader';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: featureRoutes,
  },
]);

export function Router() {
  return (
    <Suspense fallback={<CenteredLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
