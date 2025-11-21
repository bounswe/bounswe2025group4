import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Use a lightweight i18n mock for unit tests so components render translation keys
vi.mock('react-i18next', async () => await import('./__mocks__/react-i18next'));

// Prevent the real i18n instance from initializing in unit suites
vi.mock('@/lib/i18n', () => {
  const mockI18n = {
    language: 'en',
    changeLanguage: () => Promise.resolve(),
    t: (key: string) => key,
    dir: () => 'ltr',
    on: () => {},
    off: () => {},
  };

  return { default: mockI18n };
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Mock ResizeObserver for components relying on it
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;
