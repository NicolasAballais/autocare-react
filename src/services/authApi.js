import { ErrorApi, enviarJsonApi, obtenerJsonApi } from './api.js';
import { pruebaAuthActiva } from './authConfiguracion.js';
import { esObjectId } from './carritoService.js';

export function cabeceraBearer(token) {
    if (typeof token !== 'string' || !token) throw new ErrorApi('Inicia sesión conectada.', { estado: 401 });
    return { Authorization: `Bearer ${token}` };
}

export function crearClienteAuth({ habilitado = pruebaAuthActiva() } = {}) {
    async function publicar(ruta, datos, estadoEsperado) {
        if (!habilitado) throw new Error('Las pruebas de autenticación conectada están deshabilitadas.');
        return enviarJsonApi(`/auth/${ruta}`, JSON.stringify(datos), { estadoEsperado });
    }

    return {
        registrar: ({ nombre, correo, contrasena }) => publicar('registro', { nombre, correo, contrasena }, 201),
        iniciarSesion: ({ correo, contrasena }) => publicar('login', { correo, contrasena }, 200),
        consultarIdentidad: (token) => obtenerJsonApi('/auth/me', {
            cache: 'no-store', estadoEsperado: 200, cabeceras: cabeceraBearer(token)
        })
    };
}

export const authApi = crearClienteAuth();

export function validarIdentidad(usuario) {
    if (!esObjectId(usuario?.id) || !['ADMIN', 'VENDEDOR', 'CLIENTE'].includes(usuario.rol) ||
        typeof usuario.nombre !== 'string' || typeof usuario.correo !== 'string') {
        throw new Error('La API no devolvió una identidad válida.');
    }
    return { id: usuario.id.toLowerCase(), nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol };
}
