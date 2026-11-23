import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { ENVIO_ORDENES_HABILITADO, RUTA_API_ORDENES } from './src/services/ordenesConfiguracion.js'
import { AUTH_CONECTADA_HABILITADA, RUTAS_POST_AUTH } from './src/services/authConfiguracion.js'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => {
  const desarrollo = command === 'serve' && !isPreview
  const modoPrueba = ENVIO_ORDENES_HABILITADO && desarrollo
  const pruebaAuth = AUTH_CONECTADA_HABILITADA && desarrollo
  return {
    plugins: [react()],
    define: { __AUTOCARE_PRUEBA_ORDENES__: JSON.stringify(modoPrueba), __AUTOCARE_PRUEBA_AUTH__: JSON.stringify(pruebaAuth) },
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
          bypass(peticion, respuesta) {
            const esRutaOrdenes = peticion.url === RUTA_API_ORDENES
            const conexionLocal = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peticion.socket?.remoteAddress)
            const esRutaAuth = RUTAS_POST_AUTH.includes(peticion.url)
            const admitePost = conexionLocal && ((modoPrueba && esRutaOrdenes) || (pruebaAuth && esRutaAuth))
            if (peticion.method === 'GET' || peticion.method === 'HEAD' ||
                (peticion.method === 'POST' && admitePost)) return

            respuesta.writeHead(405, {
              Allow: admitePost ? 'GET, HEAD, POST' : 'GET, HEAD',
              'Content-Type': 'application/json; charset=utf-8',
            }).end(JSON.stringify({ detail: (esRutaOrdenes || esRutaAuth) && peticion.method === 'POST'
              ? 'Esta operación está deshabilitada para las pruebas actuales.'
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
