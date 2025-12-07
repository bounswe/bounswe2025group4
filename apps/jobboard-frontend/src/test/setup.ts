import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { authHandlers, profileHandlers, API_BASE_URL, jobHandlers, applicationHandlers } from './handlers';
import { workplaceHandlers } from './workplace-handlers';

/**
 * Mock react-i18next to return keys instead of translations
 * This makes tests faster and language-agnostic
 */
vi.mock('react-i18next', async () => await import('./__mocks__/react-i18next'));

/**
 * Mock the app's i18n instance to prevent initialization
 * The mocked react-i18next will handle all translation calls
 */
vi.mock('@shared/lib/i18n', () => ({
  default: {
    t: (key: string) => key,
    language: 'en',
    changeLanguage: () => Promise.resolve(),
    dir: () => 'ltr',
    on: () => {},
    off: () => {},
    use: () => ({ init: () => Promise.resolve() }),
  },
}));

export const server = setupServer(...authHandlers, ...profileHandlers, ...workplaceHandlers, ...jobHandlers, ...applicationHandlers);

vi.stubEnv('VITE_API_URL', API_BASE_URL);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  window.localStorage.clear();
});

afterAll(() => {
  server.close();
});

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => { },
      removeListener: () => { },
      addEventListener: () => { },
      removeEventListener: () => { },
      dispatchEvent: () => false,
    }),
  });
}

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
} as typeof ResizeObserver;
