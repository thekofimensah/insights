import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Enable more detailed build logs
  build: {
    sourcemap: true,
  },
  // Configure environment variables
  envPrefix: 'VITE_',
});