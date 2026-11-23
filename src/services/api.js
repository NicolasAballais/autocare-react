const URL_BASE_API = '/api/v1';

export class ErrorApi extends Error {
    constructor(mensaje, { estado, campos, causa } = {}) {
        super(mensaje, { cause: causa });
        this.name = 'ErrorApi';
        this.estado = estado;
        this.campos = campos;
    }
}

export async function obtenerJsonApi(ruta, { urlBase = URL_BASE_API, estadoEsperado, cache, cabeceras } = {}) {
    return solicitarJsonApi(ruta, { urlBase, method: 'GET', estadoEsperado, cache, cabeceras });
}

export async function enviarJsonApi(ruta, cuerpo, { urlBase = URL_BASE_API, estadoEsperado, cabeceras } = {}) {
    return solicitarJsonApi(ruta, { urlBase, method: 'POST', cuerpo, estadoEsperado, cabeceras });
}

async function solicitarJsonApi(ruta, { urlBase, method, cuerpo, estadoEsperado, cabeceras, cache }) {
    const url = urlBase.replace(/\/+$/, '') + ruta;
    const headers = { Accept: 'application/json, application/problem+json', ...cabeceras };
    const opciones = { method, headers };
    if (cache) opciones.cache = cache;
    if (method === 'POST') {
        headers['Content-Type'] = 'application/json';
        opciones.body = cuerpo;
    }
    let respuesta;

    try {
        respuesta = await fetch(url, opciones);
    } catch (causa) {
        throw new ErrorApi('No se pudo conectar con la API.', { causa });
    }

    if (!respuesta.ok) {
        const problema = await respuesta.json().catch(() => null);
        throw new ErrorApi(problema?.detail || `La API respondió con HTTP ${respuesta.status}.`, {
            estado: respuesta.status,
            campos: problema?.campos
        });
    }

    if (estadoEsperado != null && respuesta.status !== estadoEsperado) {
        throw new ErrorApi(`La API respondió con un estado inesperado (${respuesta.status}).`, {
            estado: respuesta.status
        });
    }

    if (respuesta.status === 204) {
        return null;
    }

    try {
        return await respuesta.json();
    } catch (causa) {
        throw new ErrorApi('La API no devolvió un JSON válido.', { estado: respuesta.status, causa });
    }
}
