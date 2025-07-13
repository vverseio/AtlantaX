import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api requests to our Express backend
      '/api': {
        target: 'http://localhost:3000', // Assuming backend runs on port 3000
        changeOrigin: true, // Recommended for most cases
        // secure: false, // Uncomment if backend is not HTTPS, or if using self-signed certs
      }
    }
  }
})
