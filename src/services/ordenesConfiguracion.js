// Activar únicamente después de autorizar una compra de prueba.
export const ENVIO_ORDENES_HABILITADO = false;
export const RUTA_API_ORDENES = '/api/v1/ordenes';
export const PREFIJO_PRODUCTO_TEMPORAL = 'TEST-';

export function modoPruebaOrdenesActivo() {
    return typeof __AUTOCARE_PRUEBA_ORDENES__ !== 'undefined' && __AUTOCARE_PRUEBA_ORDENES__ &&
        ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
}
