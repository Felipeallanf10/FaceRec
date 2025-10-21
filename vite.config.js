import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite' //Adicione o import
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react(), tailwindcss()], //Adicione tailwindcss()
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy para a API do backend durante o desenvolvimento
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      // Proxy para servir arquivos de upload locais (avatars etc.)
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy para Socket.IO (realtime)
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})