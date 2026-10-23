import { obtenerSesion } from './usuarios';

const CLAVE_ORDENES = 'ordenesAutoCare';

export function obtenerOrdenes() {

    const datos = localStorage.getItem(CLAVE_ORDENES);

    return datos
        ? JSON.parse(datos)
        : [];
}


function normalizarTexto(texto) {

    return String(texto || '')
        .trim()
        .toLowerCase();
}


export function ordenPerteneceAUsuario(
    orden,
    usuario
) {

    if (!usuario) {
        return false;
    }

    // El administrador puede consultar todas.
    if (usuario.rol === 'admin') {
        return true;
    }

    // Órdenes nuevas:
    // se comparan directamente mediante el ID
    // del usuario que realizó la compra.
    if (
        orden.usuarioId !== undefined &&
        orden.usuarioId !== null
    ) {

        return (
            Number(orden.usuarioId) ===
            Number(usuario.id)
        );
    }

    // Compatibilidad con órdenes antiguas,
    // creadas antes de implementar usuarios.

    const correoOrden =
        orden.usuarioCorreo ||
        orden.cliente?.correo ||
        '';

    if (
        correoOrden &&
        normalizarTexto(correoOrden) ===
        normalizarTexto(usuario.correo)
    ) {
        return true;
    }

    // Tus órdenes antiguas fueron creadas antes
    // del registro actual y usaban otro correo,
    // por eso también comprobamos el nombre.

    const nombreOrden =
        orden.cliente?.nombre || '';

    const nombreUsuario =
        `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();

    return (
        nombreOrden &&
        normalizarTexto(nombreOrden) ===
        normalizarTexto(nombreUsuario)
    );
}


export function obtenerOrdenesUsuario(usuario) {

    const ordenes = obtenerOrdenes();

    return ordenes.filter(
        (orden) =>
            ordenPerteneceAUsuario(
                orden,
                usuario
            )
    );
}


export function guardarOrden(orden) {

    const ordenes = obtenerOrdenes();

    const sesion = obtenerSesion();

    const nuevaOrden = {
        ...orden,

        // Propietario real de la compra.
        // Desde ahora las órdenes quedan
        // asociadas al usuario registrado.
        usuarioId:
            sesion?.id ?? null,

        usuarioCorreo:
            sesion?.correo ??
            orden.cliente?.correo ??
            null,

        id: Date.now(),

        fecha:
            new Date().toLocaleString(
                'es-CL'
            ),

        estado: 'Procesando'
    };

    const ordenesActualizadas = [
        ...ordenes,
        nuevaOrden
    ];

    localStorage.setItem(
        CLAVE_ORDENES,
        JSON.stringify(
            ordenesActualizadas
        )
    );

    return nuevaOrden;
}


export function actualizarEstadoOrden(
    id,
    nuevoEstado
) {

    const ordenes = obtenerOrdenes();

    const ordenesActualizadas =
        ordenes.map((orden) => {

            if (
                orden.id !== Number(id)
            ) {
                return orden;
            }

            return {
                ...orden,
                estado: nuevoEstado
            };
        });

    localStorage.setItem(
        CLAVE_ORDENES,
        JSON.stringify(
            ordenesActualizadas
        )
    );
}