import { useMatch, useOutletContext } from 'react-router-dom';

export const RUTA_CATALOGO_CONECTADO = '/catalogo-conectado';
export const RUTA_CARRITO_CONECTADO = `${RUTA_CATALOGO_CONECTADO}/carrito`;
export const RUTA_CHECKOUT_CONECTADO = `${RUTA_CARRITO_CONECTADO}/checkout`;
export const RUTA_COMPRA_CONECTADA = `${RUTA_CHECKOUT_CONECTADO}/confirmar`;
export const RUTA_LOGIN_CONECTADO = `${RUTA_CATALOGO_CONECTADO}/login`;
export const RUTA_REGISTRO_CONECTADO = `${RUTA_CATALOGO_CONECTADO}/registro`;
export const RUTA_PERFIL_CONECTADO = `${RUTA_CATALOGO_CONECTADO}/perfil`;
export const RUTA_ORDENES_CONECTADAS = `${RUTA_CATALOGO_CONECTADO}/ordenes`;
export const RUTA_CONTACTO_CONECTADO = `${RUTA_CATALOGO_CONECTADO}/contacto`;
export const RUTA_INCIDENCIAS_CONECTADAS = `${RUTA_CATALOGO_CONECTADO}/incidencias`;
export const RUTA_ADMIN_CONECTADA = `${RUTA_CATALOGO_CONECTADO}/admin`;

export function useCatalogoConectado() {
    return useOutletContext();
}

export function useBaseAdmin() {
    return useMatch(`${RUTA_ADMIN_CONECTADA}/*`) ? RUTA_ADMIN_CONECTADA : '/admin';
}
