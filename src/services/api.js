const URL_BASE_API = '/api/v1';

export class ErrorApi extends Error {
    constructor(mensaje, { estado, campos, causa } = {}) {
        super(mensaje, { cause: causa });
        this.name = 'ErrorApi';
        this.estado = estado;
        this.campos = campos;
    }
}

export async function obtenerJsonApi(ruta, { urlBase = URL_BASE_API } = {}) {
    return solicitarJsonApi(ruta, { urlBase, method: 'GET' });
}

export async function enviarJsonApi(ruta, datos, { urlBase = URL_BASE_API, estadoEsperado } = {}) {
    return solicitarJsonApi(ruta, { urlBase, method: 'POST', datos, estadoEsperado });
}

async function solicitarJsonApi(ruta, { urlBase, method, datos, estadoEsperado }) {
    const url = urlBase.replace(/\/+$/, '') + ruta;
    const headers = { Accept: 'application/json, application/problem+json' };
    const opciones = { method, headers };
    if (method === 'POST') {
        headers['Content-Type'] = 'application/json';
        opciones.body = JSON.stringify(datos);
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
