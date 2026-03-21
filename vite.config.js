import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt', // We will manually prompt the user to update
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'TaskFlow Task Manager',
        short_name: 'TaskFlow',
        description: 'A smart, offline-ready task management app.',
        theme_color: '#4f46e5', // Indigo-600 to match your UI
        background_color: '#ffffff',
        display: 'standalone', // MANDATORY for "Installable App" feel
        scope: '/',
        start_url: '/',
        // Inside vite.config.js -> VitePWA -> manifest -> icons
        icons: [
          {
            src: 'logo192.png', // Correct: No /public/ prefix
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png', // Correct
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        // Exclude API routes from SW caching since Redux/IDB handles data caching
        navigateFallbackDenylist: [/^\/api/], 
      }
    })
  ],
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
    },
  },
});