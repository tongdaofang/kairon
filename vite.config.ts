import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Prevent vite from obscuring rust errors
  clearScreen: false,

  server: {
    port: 1420,
    strictPort: true,
    // Allow Tauri to reach the dev server
    host: true,
  },

  build: {
    target: 'es2021',
    minify: 'esbuild',
    sourcemap: false,
  },
})
