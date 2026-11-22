import { useOutletContext } from 'react-router-dom';

export const RUTA_CATALOGO_CONECTADO = '/catalogo-conectado';

export function useCatalogoConectado() {
    return useOutletContext();
}
