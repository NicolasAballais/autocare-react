const CLAVE_ORDENES = 'ordenesAutoCare';

export function obtenerOrdenes() {

    const datos = localStorage.getItem(CLAVE_ORDENES);

    return datos
        ? JSON.parse(datos)
        : [];
}

export function guardarOrden(orden) {

    const ordenes = obtenerOrdenes();

    const nuevaOrden = {
        ...orden,
        id: Date.now(),
        fecha: new Date().toLocaleString('es-CL'),
        estado: 'Procesando'
    };

    const ordenesActualizadas = [
        ...ordenes,
        nuevaOrden
    ];

    localStorage.setItem(
        CLAVE_ORDENES,
        JSON.stringify(ordenesActualizadas)
    );

    return nuevaOrden;
}

export function actualizarEstadoOrden(id, nuevoEstado) {

    const ordenes = obtenerOrdenes();

    const ordenesActualizadas = ordenes.map((orden) => {

        if (orden.id !== Number(id)) {
            return orden;
        }

        return {
            ...orden,
            estado: nuevoEstado
        };
    });

    localStorage.setItem(
        CLAVE_ORDENES,
        JSON.stringify(ordenesActualizadas)
    );
}