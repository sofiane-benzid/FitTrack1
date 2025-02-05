import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  server: {
    host: true, // This exposes the server to your network
    port: 3000  // You can specify any port you want
  }
})