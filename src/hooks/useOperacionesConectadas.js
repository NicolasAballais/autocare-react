import { useCallback, useRef, useState } from 'react';
import { useSesionConectada } from '../context/sesionConectada.js';
import { useConsultaCatalogoAdmin } from './useConsultaCatalogoAdmin.js';

export function useConsultaConectada(conectado, operacion, id) {
    const { solicitar, usuario } = useSesionConectada();
    const usuarioId = usuario?.id;
    const consultar = useCallback((valor) => solicitar((token) => operacion(token, valor), usuarioId),
        [solicitar, operacion, usuarioId]);
    return useConsultaCatalogoAdmin(conectado && Boolean(usuarioId), consultar, id);
}

export function useEscrituraConectada() {
    const { demostracion, escriturasHabilitadas, solicitar, usuario } = useSesionConectada();
    const enProceso = useRef(false);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState('');
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
    const habilitada = demostracion ? escriturasHabilitadas === true :
        local && typeof __AUTOCARE_PRUEBA_GESTION__ !== 'undefined' && __AUTOCARE_PRUEBA_GESTION__;

    async function ejecutar(operacion, ...args) {
        if (!habilitada || enProceso.current) return false;
        enProceso.current = true;
        setProcesando(true);
        setError('');
        try {
            await solicitar((token) => operacion(token, ...args), usuario?.id);
            return true;
        } catch (causa) {
            setError([causa.message, ...Object.values(causa.campos ?? {})].filter(Boolean).join(' '));
            return false;
        } finally {
            enProceso.current = false;
            setProcesando(false);
        }
    }

    return { habilitada, procesando, error, ejecutar };
}
