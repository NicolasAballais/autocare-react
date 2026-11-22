import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        bypass(peticion, respuesta) {
          if (peticion.method !== 'GET' && peticion.method !== 'HEAD') {
            respuesta.writeHead(405, { Allow: 'GET, HEAD' }).end()
            // Devolver la ruta indica a Vite que omita el reenvío.
            return peticion.url
          }
        },
        configure(proxy) {
          proxy.on('error', (_error, _peticion, respuesta) => {
            if (!respuesta.headersSent && !respuesta.writableEnded) {
              respuesta.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' })
              respuesta.end(JSON.stringify({
                detail: 'No se pudo conectar con Spring Boot en 127.0.0.1:8080.',
              }))
            }
          })
        },
      },
    },
  },
})
