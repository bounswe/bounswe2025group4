import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CenteredLoader from '../components/common/CenteredLoader';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<CenteredLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ToastContainer position="bottom-right" />
    </div>
  );
}
