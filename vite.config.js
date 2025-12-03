import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Group all firebase modules together
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase-vendor';
          }
          // React core libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          // Redux libraries
          if (id.includes('node_modules/react-redux') || id.includes('node_modules/@reduxjs/toolkit')) {
            return 'redux-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react') || id.includes('node_modules/react-hot-toast')) {
            return 'ui-vendor';
          }
          // Charts library (large dependency)
          if (id.includes('node_modules/recharts')) {
            return 'charts-vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
    // Improve stability with better error recovery
    target: 'es2015',
    cssCodeSplit: true
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : []
  }
}))
