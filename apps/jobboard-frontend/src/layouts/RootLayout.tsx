import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CenteredLoader from '../components/CenteredLoader';

export default function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        <Suspense fallback={<CenteredLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
