import { useOutletContext } from 'react-router-dom';

export const RUTA_CATALOGO_CONECTADO = '/catalogo-conectado';
export const RUTA_CARRITO_CONECTADO = `${RUTA_CATALOGO_CONECTADO}/carrito`;
export const RUTA_CHECKOUT_CONECTADO = `${RUTA_CARRITO_CONECTADO}/checkout`;
export const RUTA_COMPRA_CONECTADA = `${RUTA_CHECKOUT_CONECTADO}/confirmar`;

export function useCatalogoConectado() {
    return useOutletContext();
}
