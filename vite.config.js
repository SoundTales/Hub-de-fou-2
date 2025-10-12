import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Hub-de-fou-2/', // match GitHub repository name for Pages deploy
  plugins: [react()],
  root: 'src',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    port: 5173,
    open: true
  }
});

