import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    port: 4399,
    open: true,
    host: '0.0.0.0', // Replace with the desired host IP address or domain name
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/prod-api': {
        target: 'http://192.168.218.203:9392',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/prod-api/, '')
      },
    }
  }
})
