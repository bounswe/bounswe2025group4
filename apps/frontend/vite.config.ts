import { defineConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const viteConfig =  defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});

const vitestConfig = defineVitestConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: 'vitest.setup.ts',
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

export default {
  ...viteConfig,
  ...vitestConfig,
}
