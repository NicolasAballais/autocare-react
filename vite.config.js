import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { ENVIO_ORDENES_HABILITADO, RUTA_API_ORDENES } from './src/services/ordenesConfiguracion.js'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => {
  const modoPrueba = ENVIO_ORDENES_HABILITADO && command === 'serve' && !isPreview
  return {
    plugins: [react()],
    define: { __AUTOCARE_PRUEBA_ORDENES__: JSON.stringify(modoPrueba) },
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
          bypass(peticion, respuesta) {
            const esRutaOrdenes = peticion.url === RUTA_API_ORDENES
            const conexionLocal = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peticion.socket?.remoteAddress)
            const admitePost = modoPrueba && conexionLocal && esRutaOrdenes
            if (peticion.method === 'GET' || peticion.method === 'HEAD' ||
                (peticion.method === 'POST' && admitePost)) return

            respuesta.writeHead(405, {
              Allow: admitePost ? 'GET, HEAD, POST' : 'GET, HEAD',
              'Content-Type': 'application/json; charset=utf-8',
            }).end(JSON.stringify({ detail: esRutaOrdenes && peticion.method === 'POST'
              ? 'El envío de órdenes está deshabilitado en esta etapa.'
              : 'Método no habilitado para esta ruta.' }))
            // Devolver la ruta indica a Vite que omita el reenvío.
            return peticion.url
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
  }
})
