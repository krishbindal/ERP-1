import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    fileParallelism: false,
    pool: 'threads',
    exclude: ['e2e/**', 'node_modules/**', '.next/**', '*.config.*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['e2e/**', 'node_modules/**', '.next/**', '*.config.*']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
