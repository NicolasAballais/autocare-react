export const PREFIJO_TEMPORAL = 'TEST-';

export function tienePrefijoTemporal(valor) {
    return typeof valor === 'string' && valor.startsWith(PREFIJO_TEMPORAL) && valor.length > PREFIJO_TEMPORAL.length;
}

export function esRegistroTemporal(recurso, registro) {
    return tienePrefijoTemporal(recurso === 'productos' ? registro?.codigo : registro?.nombre);
}

export function configuracionAdminLocal() {
    const local = ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname);
    if (local && typeof __AUTOCARE_PRUEBA_ADMIN__ !== 'undefined') return __AUTOCARE_PRUEBA_ADMIN__;
    return { habilitada: false, productos: [], categorias: [] };
}

export function cargarConfiguracionAdmin(entorno, desarrollo) {
    const habilitada = desarrollo && entorno.AUTOCARE_ADMIN_PRUEBA === '1';
    const ids = (variable) => habilitada
        ? (entorno[variable] ?? '').split(',').map((id) => id.trim().toLowerCase()).filter((id) => /^[0-9a-f]{24}$/.test(id))
        : [];
    return {
        habilitada, productos: ids('AUTOCARE_ADMIN_PRODUCTOS_TEMPORALES'), categorias: ids('AUTOCARE_ADMIN_CATEGORIAS_TEMPORALES')
    };
}
