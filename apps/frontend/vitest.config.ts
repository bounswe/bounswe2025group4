/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'vitest.setup.ts', // optional if you want to add global mocks/setup
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/assets/',
        'src/types/',
        'src/vite-env.d.ts',
        '**/*.d.ts',
      ],
    },
  },
});
