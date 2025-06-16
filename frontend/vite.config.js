import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src * data: blob:;
        connect-src 'self' https://beasty-backend.onrender.com http://localhost:4000 http://localhost:8000;
      `.replace(/\s+/g, ' ').trim()
    }
  }
})
