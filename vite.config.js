import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['react-redux', '@reduxjs/toolkit'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-hot-toast'],
          'charts-vendor': ['recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild'
  },
  esbuild: {
    drop: ['console', 'debugger']
  }
})
