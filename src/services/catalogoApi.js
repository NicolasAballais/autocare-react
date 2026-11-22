import { obtenerJsonApi } from './api.js';

export function obtenerProductosApi(opciones) {
    return obtenerJsonApi('/productos', opciones);
}

export function obtenerCategoriasApi(opciones) {
    return obtenerJsonApi('/categorias', opciones);
}
