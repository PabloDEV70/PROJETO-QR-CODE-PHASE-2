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
    dedupe: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@emotion/react', '@emotion/styled', 'zustand'],
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3006,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    port: 7106,
    host: true,
  },
});
