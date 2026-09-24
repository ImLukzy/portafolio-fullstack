import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      // En desarrollo, /api va al servidor Express (npm run dev levanta ambos).
      proxy: { '/api': `http://localhost:${env.PORT || 3001}` },
    },
  }
})
