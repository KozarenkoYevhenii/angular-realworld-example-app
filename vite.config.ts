import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200,
    host: true,
    strictPort: true,
  },
  preview: {
    port: 4200,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
});
