import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward API calls to the backend to avoid CORS in dev
      '/audit': {
        target: 'http://91.99.58.184:8090',
        changeOrigin: true,
      },
      '/requirements': {
        target: 'http://91.99.58.184:8090',
        changeOrigin: true,
      },
    },
  },
})
