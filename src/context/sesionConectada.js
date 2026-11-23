import { createContext, useContext } from 'react';

export const CLAVE_SESION_CONECTADA = 'sesionConectadaAutoCare';
export const SesionConectadaContext = createContext({ usuario: null, estado: 'anonima' });

export function useSesionConectada() {
    return useContext(SesionConectadaContext);
}
