const CLAVE_INCIDENCIAS = 'incidenciasAutoCare';

export function obtenerIncidencias() {

    const datos = localStorage.getItem(CLAVE_INCIDENCIAS);

    return datos ? JSON.parse(datos) : [];
}


export function guardarIncidencia(incidencia) {

    const incidencias = obtenerIncidencias();

    const nuevaIncidencia = {
        ...incidencia,
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

    const incidenciasActualizadas = incidencias.map(
        (incidencia) => {

            if (incidencia.id !== Number(id)) {
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
        JSON.stringify(incidenciasActualizadas)
    );
}