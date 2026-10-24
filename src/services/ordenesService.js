import ordenesIniciales from '../data/ordenes.json';
import { obtenerSesion } from './usuariosService';

const CLAVE_ORDENES = 'ordenesAutoCare';

export function obtenerOrdenes() {
    const datos = localStorage.getItem(CLAVE_ORDENES);

    if (datos) {
        return JSON.parse(datos);
    }

    const ordenes = ordenesIniciales.map((orden) => ({ ...orden }));

    localStorage.setItem(
        CLAVE_ORDENES,
        JSON.stringify(ordenes)
    );

    return ordenes;
}

function normalizarTexto(texto) {
    return String(texto || '').trim().toLowerCase();
}

export function ordenPerteneceAUsuario(orden, usuario) {
    if (!usuario) {
        return false;
    }

    if (usuario.rol === 'admin') {
        return true;
    }

    if (
        orden.usuarioId !== undefined &&
        orden.usuarioId !== null
    ) {
        return Number(orden.usuarioId) === Number(usuario.id);
    }

    const correoOrden =
        orden.usuarioCorreo ||
        orden.cliente?.correo ||
        '';

    if (
        correoOrden &&
        normalizarTexto(correoOrden) === normalizarTexto(usuario.correo)
    ) {
        return true;
    }

    const nombreOrden = orden.cliente?.nombre || '';

    const nombreUsuario =
        `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();

    return (
        nombreOrden &&
        normalizarTexto(nombreOrden) === normalizarTexto(nombreUsuario)
    );
}

export function obtenerOrdenesUsuario(usuario) {
    return obtenerOrdenes().filter(
        (orden) => ordenPerteneceAUsuario(orden, usuario)
    );
}

export function guardarOrden(orden) {
    const ordenes = obtenerOrdenes();
    const sesion = obtenerSesion();

    const nuevaOrden = {
        ...orden,
        usuarioId: sesion?.id ?? null,
        usuarioCorreo:
            sesion?.correo ??
            orden.cliente?.correo ??
            null,
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

    const ordenesActualizadas = ordenes.map((orden) =>
        orden.id === Number(id)
            ? { ...orden, estado: nuevoEstado }
            : orden
    );

    localStorage.setItem(
        CLAVE_ORDENES,
        JSON.stringify(ordenesActualizadas)
    );
}
