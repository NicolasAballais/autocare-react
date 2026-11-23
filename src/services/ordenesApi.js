import { enviarJsonApi, obtenerJsonApi } from './api.js';
import { esObjectId, mismoIdProducto, normalizarIdProducto } from './carritoService.js';
import { ENVIO_ORDENES_HABILITADO } from './ordenesConfiguracion.js';

export function prepararSolicitudOrden(carrito) {
    const productos = carrito.map(({ id, cantidad }) => ({ productoId: normalizarIdProducto(id), cantidad }));
    if (!productos.length || productos.some(({ productoId, cantidad }) =>
        !esObjectId(productoId) || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 2147483647
    ) || new Set(productos.map(({ productoId }) => productoId)).size !== productos.length) {
        throw new Error('Revisa los productos y las cantidades de la orden.');
    }
    return { productos };
}

export function enviarOrdenApi(solicitud) {
    if (!ENVIO_ORDENES_HABILITADO) {
        throw new Error('El envío de órdenes está deshabilitado en esta etapa.');
    }
    return enviarJsonApi('/ordenes', solicitud, { estadoEsperado: 201 });
}

export function obtenerOrdenApi(id) {
    if (!esObjectId(id)) throw new Error('El identificador de la orden no es válido.');
    return obtenerJsonApi(`/ordenes/${id}`);
}

export function idOrdenSinConfirmar(error) {
    // El contrato actual incluye el ID de la compra dentro de ProblemDetail.detail.
    return error.estado === 503
        ? error.message.match(/resultado de la orden ([a-f0-9]{24})\b/i)?.[1]?.toLowerCase()
        : undefined;
}

export function validarOrdenConfirmada(orden, idEsperado) {
    if (!esObjectId(orden?.id) || !Number.isFinite(orden.total) || orden.total < 0 ||
        (idEsperado && !mismoIdProducto(orden.id, idEsperado))) {
        throw new Error('La API no entregó una confirmación válida de la orden.');
    }
    return orden;
}
