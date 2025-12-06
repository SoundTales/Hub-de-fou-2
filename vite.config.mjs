import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Chemin relatif pour que le bundle fonctionne aussi bien sur GitHub Pages
  // (sous-répertoire) que sur un domaine personnalisé.
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
})
