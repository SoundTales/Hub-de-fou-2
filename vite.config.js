import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  appType: 'spa',
  assetsInclude: ['**/*.mp3','**/*.ogg','**/*.wav','**/*.svg'],
  base: '/Hub-de-fou-2/', // match GitHub repository name for Pages deploy
  plugins: [react()],
  root: 'src',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    assetsDir: 'assets',
    // Ensure audio and svg files are copied to the output
    rollupOptions: {
      external: [],
      output: {
        assetFileNames: (assetInfo) => {
          // Keep audio and svg files in root for easier access
          if (assetInfo.name && (assetInfo.name.endsWith('.mp3') || assetInfo.name.endsWith('.svg'))) {
            return '[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  publicDir: '../public',
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
});

