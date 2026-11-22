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
    const url = urlBase.replace(/\/+$/, '') + ruta;
    let respuesta;

    try {
        respuesta = await fetch(url, {
            method: 'GET',
            headers: { Accept: 'application/json, application/problem+json' }
        });
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

    if (respuesta.status === 204) {
        return null;
    }

    try {
        return await respuesta.json();
    } catch (causa) {
        throw new ErrorApi('La API no devolvió un JSON válido.', { estado: respuesta.status, causa });
    }
}
