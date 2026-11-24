import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { ENVIO_ORDENES_HABILITADO, RUTA_API_ORDENES } from './src/services/ordenesConfiguracion.js'
import { AUTH_CONECTADA_HABILITADA, RUTAS_POST_AUTH } from './src/services/authConfiguracion.js'
import { cargarConfiguracionAdmin, esRegistroTemporal } from './src/services/adminCatalogoConfiguracion.js'

const backendLocal = 'http://127.0.0.1:8080'

async function comprobarRegistroTemporal(url, recurso, id) {
  try {
    const respuesta = await fetch(backendLocal + url, { signal: AbortSignal.timeout(3000), redirect: 'error' })
    if (respuesta.status === 404) return 404
    if (!respuesta.ok) return 502
    const registro = await respuesta.json()
    return registro?.id === id && esRegistroTemporal(recurso, registro) ? undefined : 409
  } catch {
    return 502
  }
}

export default defineConfig(({ command, isPreview }) => {
  const desarrollo = command === 'serve' && !isPreview
  const modoPrueba = ENVIO_ORDENES_HABILITADO && desarrollo
  const pruebaAuth = AUTH_CONECTADA_HABILITADA && desarrollo
  const admin = cargarConfiguracionAdmin(process.env, desarrollo)
  return {
    plugins: [react()],
    define: { __AUTOCARE_PRUEBA_ORDENES__: JSON.stringify(modoPrueba), __AUTOCARE_PRUEBA_AUTH__: JSON.stringify(pruebaAuth),
      __AUTOCARE_PRUEBA_ADMIN__: JSON.stringify(admin) },
    server: {
      proxy: {
        '/api': {
          target: backendLocal,
          changeOrigin: true,
          async bypass(peticion, respuesta) {
            const { method, url } = peticion
            if (method === 'GET' || method === 'HEAD') return

            const esRutaOrdenes = peticion.url === RUTA_API_ORDENES
            const conexionLocal = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peticion.socket?.remoteAddress)
            const esRutaAuth = RUTAS_POST_AUTH.includes(peticion.url)
            const admitePost = conexionLocal && ((modoPrueba && esRutaOrdenes) || (pruebaAuth && esRutaAuth))
            if (method === 'POST' && admitePost) return

            const rutaCatalogo = /^\/api\/v1\/(productos|categorias)(?:\/([0-9a-f]{24}))?$/.exec(url)
            let estado = 405
            if (conexionLocal && admin.habilitada && rutaCatalogo) {
              const [, recurso, id] = rutaCatalogo
              if (method === 'POST' && !id) return
              if (id && (method === 'PUT' || method === 'DELETE') && admin[recurso].includes(id)) {
                estado = await comprobarRegistroTemporal(url, recurso, id)
                if (estado === undefined) return
              }
            }

            const detalle = {
              404: 'Registro temporal no encontrado.',
              409: 'Solo se pueden modificar o eliminar registros temporales.',
              502: 'No se pudo verificar el registro temporal con Spring Boot.'
            }
            respuesta.writeHead(estado, {
              ...(estado === 405 && { Allow: admitePost ? 'GET, HEAD, POST' : 'GET, HEAD' }),
              'Content-Type': 'application/json; charset=utf-8',
            }).end(JSON.stringify({ detail: detalle[estado] ?? ((rutaCatalogo || esRutaOrdenes || esRutaAuth) && method !== 'GET'
              ? 'Esta operación está deshabilitada para las pruebas actuales.'
              : 'Método no habilitado para esta ruta.') }))
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
