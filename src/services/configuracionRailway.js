import { obtenerJsonApi } from './api.js';

export const MODO_RAILWAY = typeof __AUTOCARE_RAILWAY__ !== 'undefined' && __AUTOCARE_RAILWAY__;

export async function consultarConfiguracionRailway() {
    const datos = await obtenerJsonApi('/configuracion', { estadoEsperado: 200, cache: 'no-store' });
    return { registro: datos?.registro === true, escrituras: datos?.escrituras === true };
}
