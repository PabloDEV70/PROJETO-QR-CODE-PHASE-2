import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'fonts/*.woff2', 'fonts/*.ttf'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}'],
        navigateFallback: '/index.html',
        // Allow ALL same-origin navigation to serve index.html (SPA)
        // API calls go to a different origin so they're never navigation requests
        navigateFallbackAllowlist: [/^\/.*$/],
        runtimeCaching: [
          {
            urlPattern: /\.(woff2|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Cache API data (cross-origin only — not same-origin navigation)
          {
            urlPattern: ({ url, sameOrigin }) =>
              !sameOrigin && (url.pathname.startsWith('/rdo') || url.pathname.startsWith('/motivos')),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-data-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Auth calls — never cache
          {
            urlPattern: ({ url, sameOrigin }) => !sameOrigin && url.pathname.startsWith('/auth'),
            handler: 'NetworkOnly',
          },
          // Funcionario fotos — cache cross-origin images from API
          {
            urlPattern: ({ url, sameOrigin }) => !sameOrigin && url.pathname.includes('/foto'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'api-fotos-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
      manifest: false,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3007,
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  preview: {
    port: 7107,
    host: true,
  },
});
