import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3002,
    host: true,
    proxy: {
      '/health': {
        target: 'https://api-micro-sankhya.gigantao.net',
        changeOrigin: true,
        secure: true,
      },
      '/armarios': {
        target: 'https://api-micro-sankhya.gigantao.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    port: 7101,
    host: true,
  },
});
