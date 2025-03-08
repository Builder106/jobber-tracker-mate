import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Add any other entry points your extension needs, such as:
        // background: resolve(__dirname, 'src/background.ts'),
        // content: resolve(__dirname, 'src/content.ts'),
        // popup: resolve(__dirname, 'src/popup.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api/places': {
        target: 'https://maps.googleapis.com/maps/api/place',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/places/, ''),
      },
    },
    port: 3000,
  },
});
