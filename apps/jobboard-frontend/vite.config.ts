/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/modules/jobs')) return 'jobs';
          if (id.includes('src/modules/mentorship')) return 'mentorship';
          if (id.includes('src/modules/forum')) return 'forum';
          if (id.includes('src/modules/workplace')) return 'workplace';
          if (id.includes('src/modules/profile')) return 'profile';
          if (id.includes('src/modules/resumeReview')) return 'resume-review';
          if (id.includes('src/modules/chat')) return 'chat';
          if (id.includes('src/modules/applications')) return 'applications';
          if (id.includes('src/modules/volunteering')) return 'volunteering';
          if (id.includes('src/modules/auth')) return 'auth';
          if (id.includes('src/modules/home')) return 'home';
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/modules/shared'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: [
      'node_modules',
      'dist',
      '**/tests/e2e/**',
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: { // it must be set to 80 at the end of the development
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
});
