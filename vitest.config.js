import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Simulates browser environment
    globals: true,
    setupFiles: './src/setupTests.js',
    css: true, // Crucial to ensure Tailwind styles don't break tests
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/setupTests.js'],
    },
  },
});