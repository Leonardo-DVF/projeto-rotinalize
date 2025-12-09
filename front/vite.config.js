import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração do proxy para evitar erro de CORS
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // endereço do backend
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          // Removido console.log para evitar logs desnecessários
        }
      },
      '/chat': {
        target: 'http://localhost:8080', // endereço do backend
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          // Removido console.log para evitar logs desnecessários
        }
      },
    },
  },
})
