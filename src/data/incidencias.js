import { obtenerSesion } from './usuarios';

import {
    obtenerOrdenes,
    ordenPerteneceAUsuario
} from './ordenes';

const CLAVE_INCIDENCIAS = 'incidenciasAutoCare';


export function obtenerIncidencias() {

    const datos = localStorage.getItem(
        CLAVE_INCIDENCIAS
    );

    return datos
        ? JSON.parse(datos)
        : [];
}


export function incidenciaPerteneceAUsuario(
    incidencia,
    usuario
) {

    if (!usuario) {
        return false;
    }

    // Administrador puede consultar todas.
    if (usuario.rol === 'admin') {
        return true;
    }

    // Incidencias nuevas:
    // quedan asociadas directamente al usuario.
    if (
        incidencia.usuarioId !== undefined &&
        incidencia.usuarioId !== null
    ) {

        return (
            Number(incidencia.usuarioId) ===
            Number(usuario.id)
        );
    }

    // Compatibilidad con incidencias antiguas.
    // Buscamos la orden relacionada y comprobamos
    // si esa orden pertenece al usuario.

    const ordenes = obtenerOrdenes();

    const ordenRelacionada = ordenes.find(
        (orden) =>
            orden.id ===
            Number(incidencia.ordenId)
    );

    if (!ordenRelacionada) {
        return false;
    }

    return ordenPerteneceAUsuario(
        ordenRelacionada,
        usuario
    );
}


export function obtenerIncidenciasUsuario(
    usuario
) {

    const incidencias =
        obtenerIncidencias();

    return incidencias.filter(
        (incidencia) =>
            incidenciaPerteneceAUsuario(
                incidencia,
                usuario
            )
    );
}


export function guardarIncidencia(
    incidencia
) {

    const incidencias =
        obtenerIncidencias();

    const sesion =
        obtenerSesion();

    const nuevaIncidencia = {
        ...incidencia,

        usuarioId:
            sesion?.id ?? null,

        usuarioCorreo:
            sesion?.correo ?? null,

        id: Date.now(),

        fecha:
            new Date().toLocaleString(
                'es-CL'
            ),

        estado: 'Pendiente'
    };

    const incidenciasActualizadas = [
        ...incidencias,
        nuevaIncidencia
    ];

    localStorage.setItem(
        CLAVE_INCIDENCIAS,
        JSON.stringify(
            incidenciasActualizadas
        )
    );

    return nuevaIncidencia;
}


export function actualizarEstadoIncidencia(
    id,
    nuevoEstado
) {

    const incidencias =
        obtenerIncidencias();

    const incidenciasActualizadas =
        incidencias.map(
            (incidencia) => {

                if (
                    incidencia.id !== Number(id)
                ) {
                    return incidencia;
                }

                return {
                    ...incidencia,
                    estado: nuevoEstado
                };
            }
        );

    localStorage.setItem(
        CLAVE_INCIDENCIAS,
        JSON.stringify(
            incidenciasActualizadas
        )
    );
}