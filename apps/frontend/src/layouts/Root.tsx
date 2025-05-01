import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';

export default function RootLayout() {
  return (
    <div>
      <header>
        {/* Add your navigation here */}
        <nav>{/* Add nav items */}</nav>
      </header>

      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>

      <footer>{/* Add footer content */}</footer>
    </div>
  );
}
