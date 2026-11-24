import { Fragment } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { RUTA_CATALOGO_CONECTADO, RUTA_LOGIN_CONECTADO } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';

export default function RutaConectada({ roles, children, porUsuario = false, publica = false }) {
    const { usuario, estado, error, restaurarSesion } = useSesionConectada();
    const { pathname } = useLocation();
    if (estado === 'verificando') return <p className="container my-4" role="status">Verificando sesión conectada…</p>;
    if (!publica && estado === 'error') return (
        <div className="container my-4" role="alert">{error}{' '}
            <button type="button" className="btn btn-outline-secondary" onClick={restaurarSesion}>Reintentar verificación</button>
        </div>
    );
    if (!publica && !usuario) return <Navigate replace to={RUTA_LOGIN_CONECTADO} state={{ volver: pathname }} />;
    if (usuario && roles && !roles.includes(usuario.rol)) return (
        <div className="container my-4" role="alert">Tu rol no tiene permiso para abrir esta página.{' '}
            <Link to={RUTA_CATALOGO_CONECTADO}>Volver al catálogo conectado</Link>
        </div>
    );
    return <Fragment key={porUsuario ? usuario?.id : undefined}>{children ?? <Outlet />}</Fragment>;
}
