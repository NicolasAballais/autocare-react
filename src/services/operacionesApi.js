import { enviarJsonApi, obtenerJsonApi } from './api.js';
import { cabeceraBearer } from './authApi.js';
import { esObjectId } from './carritoService.js';

function leer(ruta, token) {
    return obtenerJsonApi(ruta, { estadoEsperado: 200, cache: 'no-store', cabeceras: cabeceraBearer(token()) });
}

function escribir(ruta, token, method, estadoEsperado, datos) {
    return enviarJsonApi(ruta, datos === undefined ? undefined : JSON.stringify(datos),
        { method, estadoEsperado, cabeceras: cabeceraBearer(token()) });
}

function idValido(id) {
    if (!esObjectId(id)) throw new Error('El identificador no es válido.');
    return id;
}

export const listarClientesApi = (token) => leer('/usuarios', token);
export const obtenerClienteApi = (token, id) => leer(`/usuarios/${idValido(id)}`, token);
export const listarOrdenesClienteApi = (token, id) => leer(`/usuarios/${idValido(id)}/ordenes`, token);
export const crearClienteApi = (token, alta) => escribir('/usuarios', token, 'POST', 201, alta);
export const editarClienteApi = (token, id, datos) => escribir(`/usuarios/${idValido(id)}`, token, 'PUT', 200, datos);

export const listarIncidenciasApi = (token) => leer('/incidencias', token);
export const crearIncidenciaApi = (token, datos) => escribir('/incidencias', token, 'POST', 201, datos);
export const resolverIncidenciaApi = (token, id) => escribir(`/incidencias/${idValido(id)}/resolucion`, token, 'PUT', 204);
export const marcarOrdenEnviadaApi = (token, id) => escribir(`/ordenes/${idValido(id)}/envio`, token, 'PUT', 204);

export const obtenerPerfilApi = (token) => leer('/usuarios/me/perfil', token);
export const editarPerfilApi = (token, datos) => escribir('/usuarios/me/perfil', token, 'PUT', 200, datos);
export const enviarContactoApi = (token, datos) => escribir('/contacto', token, 'POST', 204, datos);

const fecha = new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Santiago'
});

const estados = { PROCESANDO: 'Procesando', ENVIADO: 'Enviado', PENDIENTE: 'Pendiente', RESUELTA: 'Resuelta' };

export function formatearRegistro(registro) {
    const instante = new Date(registro.fechaCreacion ?? registro.fecha ?? '');
    return {
        ...registro,
        fecha: Number.isFinite(instante.getTime()) ? fecha.format(instante) : '—',
        estado: estados[registro.estado] ?? registro.estado
    };
}
