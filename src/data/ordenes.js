const CLAVE_ORDENES = 'ordenesAutoCare';

export function obtenerOrdenes() {

    const ordenesGuardadas =
        localStorage.getItem(CLAVE_ORDENES);

    if (!ordenesGuardadas) {
        return [];
    }

    return JSON.parse(ordenesGuardadas);
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