import incidenciasIniciales from '../data/incidencias.json';
import { obtenerSesion } from './usuariosService';
import {
    obtenerOrdenes,
    ordenPerteneceAUsuario
} from './ordenesService';

const CLAVE_INCIDENCIAS = 'incidenciasAutoCare';

export function obtenerIncidencias() {
    const datos = localStorage.getItem(CLAVE_INCIDENCIAS);

    if (datos) {
        return JSON.parse(datos);
    }

    const incidencias = incidenciasIniciales.map((incidencia) => ({ ...incidencia }));

    localStorage.setItem(
        CLAVE_INCIDENCIAS,
        JSON.stringify(incidencias)
    );

    return incidencias;
}

export function incidenciaPerteneceAUsuario(incidencia, usuario) {
    if (!usuario) {
        return false;
    }

    if (usuario.rol === 'admin') {
        return true;
    }

    if (
        incidencia.usuarioId !== undefined &&
        incidencia.usuarioId !== null
    ) {
        return Number(incidencia.usuarioId) === Number(usuario.id);
    }

    const ordenRelacionada = obtenerOrdenes().find(
        (orden) => orden.id === Number(incidencia.ordenId)
    );

    if (!ordenRelacionada) {
        return false;
    }

    return ordenPerteneceAUsuario(
        ordenRelacionada,
        usuario
    );
}

export function obtenerIncidenciasUsuario(usuario) {
    return obtenerIncidencias().filter(
        (incidencia) => incidenciaPerteneceAUsuario(incidencia, usuario)
    );
}

export function guardarIncidencia(incidencia) {
    const incidencias = obtenerIncidencias();
    const sesion = obtenerSesion();

    const nuevaIncidencia = {
        ...incidencia,
        usuarioId: sesion?.id ?? null,
        usuarioCorreo: sesion?.correo ?? null,
        id: Date.now(),
        fecha: new Date().toLocaleString('es-CL'),
        estado: 'Pendiente'
    };

    const incidenciasActualizadas = [
        ...incidencias,
        nuevaIncidencia
    ];

    localStorage.setItem(
        CLAVE_INCIDENCIAS,
        JSON.stringify(incidenciasActualizadas)
    );

    return nuevaIncidencia;
}

export function actualizarEstadoIncidencia(id, nuevoEstado) {
    const incidencias = obtenerIncidencias();

    const incidenciasActualizadas = incidencias.map((incidencia) =>
        incidencia.id === Number(id)
            ? { ...incidencia, estado: nuevoEstado }
            : incidencia
    );

    localStorage.setItem(
        CLAVE_INCIDENCIAS,
        JSON.stringify(incidenciasActualizadas)
    );
}
