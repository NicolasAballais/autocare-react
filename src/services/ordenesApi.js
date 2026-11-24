import { enviarJsonApi, obtenerJsonApi } from './api.js';
import { obtenerProductosApi } from './catalogoApi.js';
import { esObjectId, mismoIdProducto, normalizarIdProducto } from './carritoService.js';
import { modoPruebaOrdenesActivo, PREFIJO_PRODUCTO_TEMPORAL } from './ordenesConfiguracion.js';
import { cabeceraBearer } from './authApi.js';

export class EnvioOrdenBloqueado extends Error {}

export function generarClaveOrden() {
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function prepararSolicitudOrden(carrito) {
    const productos = carrito.map(({ id, cantidad }) => ({ productoId: normalizarIdProducto(id), cantidad }));
    if (!productos.length || productos.some(({ productoId, cantidad }) =>
        !esObjectId(productoId) || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 2147483647
    ) || new Set(productos.map(({ productoId }) => productoId)).size !== productos.length) {
        throw new Error('Revisa los productos y las cantidades de la orden.');
    }
    return { productos };
}

export function solicitudDelIntento(intento) {
    if (!esObjectId(intento?.id) || typeof intento.cuerpo !== 'string') return null;
    try {
        const datos = JSON.parse(intento.cuerpo);
        if (Object.keys(datos).length !== 1 || !Array.isArray(datos.productos) || datos.productos.some((linea) =>
            !linea || Object.keys(linea).length !== 2 || !esObjectId(linea.productoId))) return null;
        prepararSolicitudOrden(datos.productos.map(({ productoId, cantidad }) => ({ id: productoId, cantidad })));
        return datos;
    } catch {
        return null;
    }
}

export function sonProductosTemporales(solicitud, catalogo) {
    return Boolean(solicitud?.productos.length && Array.isArray(catalogo) && solicitud.productos.every(({ productoId }) =>
        catalogo.some((producto) => mismoIdProducto(producto?.id, productoId) &&
            typeof producto.codigo === 'string' && producto.codigo.startsWith(PREFIJO_PRODUCTO_TEMPORAL))));
}

export function crearEnvioOrden({ habilitado = modoPruebaOrdenesActivo(), soloTemporales = true } = {}) {
    return async function enviar(intento, obtenerToken) {
        if (!habilitado) throw new EnvioOrdenBloqueado('El envío de órdenes está deshabilitado en esta etapa.');
        const solicitud = solicitudDelIntento(intento);
        if (!solicitud) throw new EnvioOrdenBloqueado('El intento de compra guardado no es válido.');

        if (soloTemporales) {
            let catalogo;
            try {
                catalogo = await obtenerProductosApi({ cache: 'no-store' });
            } catch {
                throw new EnvioOrdenBloqueado('No se pudo verificar el catálogo antes de enviar la compra.');
            }
            if (!sonProductosTemporales(solicitud, catalogo)) {
                throw new EnvioOrdenBloqueado('La prueba admite únicamente productos temporales con código TEST-.');
            }
        }
        return enviarJsonApi('/ordenes', intento.cuerpo, {
            estadoEsperado: 201, cabeceras: { ...cabeceraBearer(obtenerToken?.()), 'Idempotency-Key': intento.id }
        });
    };
}

export function enviarOrdenApi(intento, obtenerToken) {
    return crearEnvioOrden()(intento, obtenerToken);
}

export function obtenerOrdenApi(id, obtenerToken) {
    if (!esObjectId(id)) throw new Error('El identificador de la orden no es válido.');
    return obtenerJsonApi(`/ordenes/${id}`, { estadoEsperado: 200, cache: 'no-store',
        cabeceras: cabeceraBearer(obtenerToken?.()) });
}

export function listarOrdenesApi(obtenerToken) {
    return obtenerJsonApi('/ordenes', { estadoEsperado: 200, cache: 'no-store', cabeceras: cabeceraBearer(obtenerToken?.()) });
}

export function mismosProductos(primera, segunda) {
    return primera.length === segunda.length && primera.every(({ productoId, cantidad }) =>
        segunda.some((linea) => mismoIdProducto(linea?.productoId, productoId) && linea.cantidad === cantidad));
}

export function validarOrdenConfirmada(orden, intento) {
    const solicitud = solicitudDelIntento(intento);
    if (!solicitud || !esObjectId(orden?.id) || !mismoIdProducto(orden.id, intento.id) ||
        !Number.isFinite(orden.total) || orden.total < 0 || !Array.isArray(orden.productos) ||
        !mismosProductos(solicitud.productos, orden.productos) ||
        orden.productos.some((linea) => typeof linea.nombre !== 'string' || !linea.nombre.trim())) {
        throw new Error('La API no entregó una confirmación válida de la orden.');
    }
    return orden;
}
