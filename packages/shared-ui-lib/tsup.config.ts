import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'react-router-dom',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
    '@tanstack/react-query',
    'axios',
    'zustand',
  ],
});
