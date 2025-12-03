import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT : Remplacez '/Hub-de-fou-2-1/' par le nom exact de votre dépôt GitHub entre slashes.
// Exemple : si votre dépôt est https://github.com/user/mon-projet, mettez '/mon-projet/'
export default defineConfig({
  base: '/Hub-de-fou-2-1/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
})
