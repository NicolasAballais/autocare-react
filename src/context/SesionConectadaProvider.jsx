import { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorApi } from '../services/api.js';
import { authApi, validarIdentidad } from '../services/authApi.js';
import { pruebaAuthActiva } from '../services/authConfiguracion.js';
import { CLAVE_SESION_CONECTADA, SesionConectadaContext } from './sesionConectada.js';

function leerSesion() {
    try {
        const datos = JSON.parse(sessionStorage.getItem(CLAVE_SESION_CONECTADA));
        return typeof datos?.token === 'string' && datos.token && Number.isFinite(datos.expiraEn) ? datos : null;
    } catch {
        return null;
    }
}

export default function SesionConectadaProvider({ children, api = authApi, habilitado = pruebaAuthActiva() }) {
    const [sesion, setSesion] = useState(leerSesion);
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState('');
    const actual = useRef(sesion);
    const usuarioActual = useRef(null);
    const version = useRef(0);

    const cerrarSesion = useCallback(() => {
        version.current++;
        actual.current = null;
        usuarioActual.current = null;
        try {
            sessionStorage.removeItem(CLAVE_SESION_CONECTADA);
        } catch {
            // El navegador puede bloquear el almacenamiento de la pestaña.
        }
        setSesion(null);
        setUsuario(null);
        setError('');
    }, []);

    const consultarIdentidad = useCallback(async (credencial) => {
        if (Date.now() >= credencial.expiraEn) throw new ErrorApi('La sesión conectada expiró.', { estado: 401 });
        const identidad = validarIdentidad(await api.consultarIdentidad(credencial.token));
        if (Date.now() >= credencial.expiraEn) throw new ErrorApi('La sesión conectada expiró.', { estado: 401 });
        return identidad;
    }, [api]);

    const restaurarSesion = useCallback(async () => {
        const credencial = actual.current;
        if (!credencial || usuarioActual.current) return;
        setError('');
        try {
            const identidad = await consultarIdentidad(credencial);
            if (actual.current !== credencial) return;
            usuarioActual.current = identidad;
            setUsuario(identidad);
        } catch (causa) {
            if (actual.current !== credencial) return;
            if (causa.estado === 401) cerrarSesion();
            else setError('No se pudo verificar la sesión conectada.');
        }
    }, [cerrarSesion, consultarIdentidad]);

    useEffect(() => { restaurarSesion(); }, [restaurarSesion]);

    useEffect(() => {
        if (!sesion) return;
        const temporizador = setTimeout(() => {
            if (actual.current === sesion) cerrarSesion();
        }, Math.max(0, sesion.expiraEn - Date.now()));
        return () => clearTimeout(temporizador);
    }, [cerrarSesion, sesion]);

    async function iniciarSesion(datos) {
        const intento = ++version.current;
        const { token, expiraEnSegundos, tipo } = await api.iniciarSesion(datos);
        if (tipo !== 'Bearer' || typeof token !== 'string' || !token || !Number.isFinite(expiraEnSegundos) || expiraEnSegundos <= 0) {
            throw new Error('Respuesta de autenticación inválida.');
        }
        const nuevaSesion = { token, expiraEn: Date.now() + expiraEnSegundos * 1000 };
        const identidad = await consultarIdentidad(nuevaSesion);
        if (version.current !== intento) return null;

        sessionStorage.setItem(CLAVE_SESION_CONECTADA, JSON.stringify(nuevaSesion));
        actual.current = nuevaSesion;
        usuarioActual.current = identidad;
        setSesion(nuevaSesion);
        setUsuario(identidad);
        setError('');
        return identidad;
    }

    const solicitar = useCallback(async (operacion, usuarioId) => {
        const credencial = actual.current;
        function tokenVigente() {
            if (!credencial || !usuarioActual.current || actual.current !== credencial ||
                (usuarioId && usuarioActual.current.id !== usuarioId)) {
                throw new ErrorApi('La sesión conectada cambió. Vuelve a iniciar sesión.', { estado: 401 });
            }
            if (Date.now() >= credencial.expiraEn) {
                cerrarSesion();
                throw new ErrorApi('La sesión conectada expiró.', { estado: 401 });
            }
            return credencial.token;
        }

        tokenVigente();
        try {
            const resultado = await operacion(tokenVigente);
            tokenVigente();
            return resultado;
        } catch (causa) {
            if (credencial !== actual.current) {
                throw new ErrorApi('La sesión conectada cambió. Vuelve a iniciar sesión.', { estado: 401 });
            }
            if (causa.estado === 401) cerrarSesion();
            throw causa;
        }
    }, [cerrarSesion]);

    const estado = usuario ? 'autenticada' : sesion ? (error ? 'error' : 'verificando') : 'anonima';
    return <SesionConectadaContext.Provider value={{ usuario, estado, error, habilitado, iniciarSesion,
        registrar: api.registrar, cerrarSesion, restaurarSesion, solicitar }}>
        {children}
    </SesionConectadaContext.Provider>;
}
