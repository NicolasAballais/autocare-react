import { ErrorApi, enviarJsonApi } from './api.js';
import { cabeceraBearer } from './authApi.js';
import { obtenerCategoriaApi, obtenerCategoriasApi, obtenerProductoApi, obtenerProductosApi } from './catalogoApi.js';
import { configuracionAdminLocal, esRegistroTemporal } from './adminCatalogoConfiguracion.js';

const sinCache = { cache: 'no-store' };
export const listarProductosAdmin = () => obtenerProductosApi(sinCache);
export const listarCategoriasAdmin = () => obtenerCategoriasApi(sinCache);
export const cargarProductoAdmin = (id) => obtenerProductoApi(id, sinCache);

export class EscrituraAdminBloqueada extends Error {}

export function crearAdminCatalogoApi(configuracion = configuracionAdminLocal()) {
    const { habilitada } = configuracion;

    function puedeEditar(recurso, registro) {
        return habilitada && esRegistroTemporal(recurso, registro) && configuracion[recurso].includes(registro.id);
    }

    async function escribir(recurso, metodo, id, datos, obtenerToken, original) {
        if (!habilitada) throw new EscrituraAdminBloqueada('Las escrituras administrativas están deshabilitadas.');
        if (metodo !== 'DELETE' && !esRegistroTemporal(recurso, datos)) {
            throw new EscrituraAdminBloqueada('El código de producto o nombre de categoría debe empezar con TEST-.');
        }
        if (metodo !== 'POST') {
            if (!configuracion[recurso].includes(id)) {
                throw new EscrituraAdminBloqueada('El identificador debe estar en la lista de registros temporales autorizados.');
            }
            const actual = await (recurso === 'productos' ? cargarProductoAdmin(id) : obtenerCategoriaApi(id, sinCache));
            if (actual?.id !== id || !puedeEditar(recurso, actual)) {
                throw new EscrituraAdminBloqueada('El registro ya no cumple las condiciones de la prueba temporal.');
            }
            if (original && Object.keys(datos).some((campo) => original[campo] !== actual[campo])) {
                throw new EscrituraAdminBloqueada('El registro cambió desde que lo abriste. Vuelve a cargar los datos antes de guardar.');
            }
        }
        if (recurso === 'productos' && datos) {
            const categoria = await obtenerCategoriaApi(datos.categoriaId, sinCache);
            if (categoria?.id !== datos.categoriaId || !esRegistroTemporal('categorias', categoria)) {
                throw new EscrituraAdminBloqueada('Selecciona una categoría temporal con nombre TEST-.');
            }
        }
        if (recurso === 'categorias' && metodo === 'PUT') {
            const productos = await listarProductosAdmin();
            if (productos.some((producto) => producto.categoriaId === id && !esRegistroTemporal('productos', producto))) {
                throw new EscrituraAdminBloqueada('La categoría está asociada a productos que no son temporales.');
            }
        }
        const cabeceras = cabeceraBearer(obtenerToken?.());
        const estadoEsperado = { POST: 201, PUT: 200, DELETE: 204 }[metodo];
        return enviarJsonApi(`/${recurso}${id ? `/${id}` : ''}`, datos && JSON.stringify(datos), {
            method: metodo, estadoEsperado, cabeceras
        });
    }

    return {
        habilitada, puedeEditar,
        guardarProducto: (id, datos, token, original) => escribir('productos', id ? 'PUT' : 'POST', id, datos, token, original),
        eliminarProducto: (id, token) => escribir('productos', 'DELETE', id, undefined, token),
        guardarCategoria: (id, datos, token, original) => escribir('categorias', id ? 'PUT' : 'POST', id, datos, token, original),
        eliminarCategoria: (id, token) => escribir('categorias', 'DELETE', id, undefined, token)
    };
}

export const adminCatalogoApi = crearAdminCatalogoApi();

export function mensajeErrorAdmin(error) {
    if (error instanceof EscrituraAdminBloqueada) return error.message;
    if (error instanceof ErrorApi && [400, 409].includes(error.estado)) return error.message;
    return {
        401: 'La sesión venció. Inicia sesión nuevamente.',
        403: 'Tu cuenta no tiene permiso para realizar esta operación.',
        404: 'El registro ya no existe. Actualiza el listado.'
    }[error.estado] ?? 'No se pudo completar la operación con Spring Boot. Intenta nuevamente.';
}
