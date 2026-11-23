// Habilitar solo cuando se autorice la prueba de autenticación local.
export const AUTH_CONECTADA_HABILITADA = false;
export const RUTAS_POST_AUTH = ['/api/v1/auth/registro', '/api/v1/auth/login'];

export function pruebaAuthActiva() {
    return typeof __AUTOCARE_PRUEBA_AUTH__ !== 'undefined' && __AUTOCARE_PRUEBA_AUTH__ &&
        ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
}
