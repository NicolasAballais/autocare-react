import { obtenerJsonApi } from './api.js';

export function obtenerProductosApi(opciones) {
    return obtenerJsonApi('/productos', opciones);
}

export function obtenerCategoriasApi(opciones) {
    return obtenerJsonApi('/categorias', opciones);
}

export function obtenerProductoApi(id, opciones) {
    return obtenerJsonApi(`/productos/${encodeURIComponent(id)}`, opciones);
}

export function obtenerCategoriaApi(id, opciones) {
    return obtenerJsonApi(`/categorias/${encodeURIComponent(id)}`, opciones);
}
