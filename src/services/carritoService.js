import { obtenerProductosApi } from './catalogoApi.js';

const FORMATO_OBJECT_ID = /^[0-9a-f]{24}$/i;

export function normalizarIdProducto(id) {
    if (Number.isSafeInteger(id)) return String(id);
    if (typeof id !== 'string') return '';

    const texto = id.trim();
    return FORMATO_OBJECT_ID.test(texto) ? texto.toLowerCase() : texto;
}

export function esObjectId(id) {
    return typeof id === 'string' && FORMATO_OBJECT_ID.test(id);
}

export function mismoIdProducto(idA, idB) {
    const id = normalizarIdProducto(idA);
    return id !== '' && id === normalizarIdProducto(idB);
}

export function esIdProductoLocal(id) {
    const texto = normalizarIdProducto(id);
    return /^(0|[1-9]\d{0,15})$/.test(texto) && Number.isSafeInteger(Number(texto));
}

function normalizarCodigo(codigo) {
    return typeof codigo === 'string' ? codigo.trim().toUpperCase() : '';
}

function buscarProductoEnCatalogo(item, productos) {
    const porId = productos.find((producto) => mismoIdProducto(producto.id, item.id));
    if (porId || !esIdProductoLocal(item.id)) return porId;

    const codigo = normalizarCodigo(item.codigo);
    if (codigo) return productos.find((producto) => normalizarCodigo(producto.codigo) === codigo);
}

export function proponerCarritoConectado(carrito, productos) {
    const productosPorId = new Map();
    const avisos = [];

    for (const item of carrito) {
        const datosLinea = { id: item.id, codigo: item.codigo, cantidad: item.cantidad };
        const cantidad = typeof item.cantidad === 'string' ? Number(item.cantidad) : item.cantidad;
        if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
            avisos.push({ tipo: 'cantidad-invalida', ...datosLinea });
            continue;
        }

        const producto = buscarProductoEnCatalogo(item, productos);
        if (!producto) {
            avisos.push({ tipo: 'producto-inexistente', ...datosLinea });
            continue;
        }

        const id = normalizarIdProducto(producto.id);
        const cantidadAcumulada = productosPorId.get(id)?.cantidadSolicitada ?? 0;
        productosPorId.set(id, { producto, cantidadSolicitada: cantidadAcumulada + cantidad });

        if (Number(item.precio) !== producto.precioFinal) {
            avisos.push({
                tipo: 'precio-modificado', id, codigo: producto.codigo,
                precioAnterior: item.precio, precioActual: producto.precioFinal
            });
        }

        if (item.stock != null && Number(item.stock) !== producto.stock) {
            avisos.push({
                tipo: 'stock-modificado', id, codigo: producto.codigo,
                stockAnterior: item.stock, stockActual: producto.stock
            });
        }
    }

    const carritoPropuesto = [];
    for (const [id, { producto, cantidadSolicitada }] of productosPorId) {
        const cantidad = Math.min(cantidadSolicitada, producto.stock);
        if (cantidad < cantidadSolicitada) {
            avisos.push({
                tipo: 'stock-insuficiente', id, codigo: producto.codigo,
                cantidadSolicitada, cantidadDisponible: cantidad
            });
        }

        if (cantidad > 0) {
            carritoPropuesto.push({
                ...producto,
                id,
                precioOriginal: producto.precio,
                precio: producto.precioFinal,
                cantidad
            });
        }
    }

    return { carritoPropuesto, avisos };
}

export async function prepararCarritoConectado(carrito, opciones) {
    const productos = await obtenerProductosApi(opciones);
    if (!Array.isArray(productos)) {
        throw new Error('La API no devolvió un listado de productos.');
    }

    return proponerCarritoConectado(carrito, productos);
}

export function lineaCarritoConectado(producto, cantidad) {
    return { ...producto, id: normalizarIdProducto(producto.id),
        precioOriginal: producto.precio, precio: producto.precioFinal, cantidad };
}

export function revisarCarritoConectado(carrito, productos) {
    return carrito.map((linea) => {
        const producto = productos.find((item) => mismoIdProducto(item.id, linea.id));
        return producto
            ? { ...lineaCarritoConectado(producto, linea.cantidad), precioAnterior: linea.precio }
            : { ...linea, stock: 0, noDisponible: true };
    });
}
