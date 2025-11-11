import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { InitialEntry } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ToastContainer } from 'react-toastify';
import { I18nProvider } from '@/providers/I18nProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import 'react-toastify/dist/ReactToastify.css';

type RenderOptions = {
  initialEntries?: InitialEntry[];
};

/**
 * Wrapper component that provides all required providers for testing
 * Includes ToastContainer for displaying toast notifications in tests
 */
const Providers = ({ children, initialEntries = ['/'] }: { children: ReactNode; initialEntries?: InitialEntry[] }) => (
  <I18nProvider>
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="*" element={children} />
        </Routes>
        <ToastContainer />
      </MemoryRouter>
    </AuthProvider>
  </I18nProvider>
);

/**
 * Custom render function that wraps components with all necessary providers
 * Automatically cleans up auth state before each render to ensure test isolation
 *
 * @param ui - React element to render
 * @param options - Render options including initialEntries for routing
 * @returns Render result from @testing-library/react
 *
 * @example
 * ```tsx
 * renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });
 * ```
 */
export function renderWithProviders(ui: ReactElement, options: RenderOptions = {}) {
  const { initialEntries = ['/'] } = options;

  // Clear auth store state before rendering to ensure clean test environment
  // This prevents cross-test contamination from persisted state
  useAuthStore.getState().clearSession();

  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Providers initialEntries={initialEntries}>{children}</Providers>
    ),
  });
}

/**
 * Sets up user event for simulating user interactions in tests
 *
 * @returns Configured userEvent instance
 *
 * @example
 * ```tsx
 * const user = setupUserEvent();
 * await user.type(screen.getByLabelText(/username/i), 'testuser');
 * await user.click(screen.getByRole('button', { name: /submit/i }));
 * ```
 */
export function setupUserEvent() {
  return userEvent.setup();
}
