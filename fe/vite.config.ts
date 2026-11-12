import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      // En desarrollo, /api se reenvía al backend FastAPI: sin CORS ni URLs fijas en el código.
      proxy: {
        '/api': { target: env.DEV_API_PROXY || 'http://localhost:8000', changeOrigin: true },
      },
    },
    build: { sourcemap: false },
  }
})
