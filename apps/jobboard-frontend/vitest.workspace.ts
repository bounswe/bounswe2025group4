/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import baseViteConfig from './vite.config';

const { test: _test, ...baseConfig } = baseViteConfig;

const sharedTestOptions = {
  globals: true,
  environment: 'jsdom' as const,
  css: true,
  coverage: {
    provider: 'v8' as const,
    reporter: ['text', 'lcov'],
    thresholds: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
};

export default [
  defineConfig({
    ...baseConfig,
    test: {
      ...sharedTestOptions,
      name: 'unit',
      include: ['src/__tests__/**/components/**/*.test.tsx'],
      setupFiles: './src/test/setup.unit.ts',
    },
  }),
  defineConfig({
    ...baseConfig,
    test: {
      ...sharedTestOptions,
      name: 'integration',
      include: ['src/**/*.{test,spec}.?(c|m)[tj]s?(x)'],
      exclude: [
        'node_modules',
        'dist',
        'src/__tests__/**/components/**/*.test.tsx',
      ],
      setupFiles: './src/test/setup.ts',
    },
  }),
];
