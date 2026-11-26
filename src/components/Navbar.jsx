import { Link, useMatch, useNavigate } from 'react-router-dom';
import { obtenerSesion, cerrarSesion } from '../services/usuariosService';
import { useCarrito } from '../context/CarritoContext';
import { RUTA_ADMIN_CONECTADA, RUTA_CARRITO_CONECTADO, RUTA_CATALOGO_CONECTADO,
    RUTA_LOGIN_CONECTADO, RUTA_ORDENES_CONECTADAS, RUTA_PERFIL_CONECTADO, RUTA_INCIDENCIAS_CONECTADAS, RUTA_CONTACTO_CONECTADO } from '../context/catalogo';
import { useCarritoConectado } from '../context/CarritoConectadoContext.jsx';
import { useSesionConectada } from '../context/sesionConectada';

export default function Navbar() {

    const rutaConectada = Boolean(useMatch(`${RUTA_CATALOGO_CONECTADO}/*`));

    const navigate = useNavigate();
    const sesionConectada = useSesionConectada();
    const { demostracion } = sesionConectada;
    const conectado = demostracion || rutaConectada;
    const sesion = conectado ? sesionConectada.usuario : obtenerSesion();
    const vendedor = conectado && sesion?.rol === 'VENDEDOR';
    const { cantidadTotal } = useCarrito();
    const remoto = useCarritoConectado();
    const identidad = <><i className="bi bi-person-circle fs-4 me-1"></i>{sesion?.nombre}</>;

    function manejarCerrarSesion() {
        if (conectado) {
            sesionConectada.cerrarSesion();
            navigate(vendedor ? RUTA_LOGIN_CONECTADO : RUTA_CATALOGO_CONECTADO, { replace: true });
            return;
        }
        cerrarSesion();
        window.location.href = '/';
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

            <div className="container">

                <Link
                    to={vendedor || demostracion ? RUTA_CATALOGO_CONECTADO : '/'}
                    className="navbar-brand fw-bold"
                >
                    AutoCare<span className="text-danger">Pro</span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Abrir navegación"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="collapse navbar-collapse"
                    id="navbarNav"
                >

                    <ul className="navbar-nav">

                        {!vendedor && !demostracion && <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Inicio
                            </Link>
                        </li>}

                        <li className="nav-item">
                            <Link className="nav-link" to={conectado ? RUTA_CATALOGO_CONECTADO : '/productos'}>
                                Productos
                            </Link>
                        </li>

                        {!vendedor && <>
                            <li className="nav-item">
                                <Link className="nav-link" to={conectado ? `${RUTA_CATALOGO_CONECTADO}/categorias` : '/categorias'}>
                                    Categorías
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link
                                    className="nav-link"
                                    to={conectado ? `${RUTA_CATALOGO_CONECTADO}/ofertas` : '/ofertas'}
                                >
                                    Ofertas
                                </Link>
                            </li>
                        </>}

                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                to={conectado ? RUTA_ORDENES_CONECTADAS : '/ordenes'}
                            >
                                {conectado && ['ADMIN', 'VENDEDOR'].includes(sesion?.rol) ? 'Órdenes' : 'Mis órdenes'}
                            </Link>
                        </li>

                        {['cliente', 'CLIENTE'].includes(sesion?.rol) && (
                            <li className="nav-item">
                                <Link
                                    className="nav-link"
                                    to={conectado ? RUTA_INCIDENCIAS_CONECTADAS : '/incidencias'}
                                >
                                    Mis incidencias
                                </Link>
                            </li>
                        )}

                        {sesion?.rol === (conectado ? 'ADMIN' : 'admin') && (

                            <li className="nav-item">

                                <Link
                                    to={conectado ? RUTA_ADMIN_CONECTADA : '/admin'}
                                    className="nav-link"
                                >
                                    Administración
                                </Link>

                            </li>

                        )}

                        {!vendedor && !demostracion && <>
                            <li className="nav-item">
                                <Link className="nav-link" to="/nosotros">
                                    Nosotros
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/blog">
                                    Blog
                                </Link>
                            </li>

                        </>}
                        {!vendedor && <li className="nav-item">
                                <Link className="nav-link" to={conectado ? RUTA_CONTACTO_CONECTADO : '/contacto'}>
                                    Contacto
                                </Link>
                            </li>}

                    </ul>

                    {sesion ? (

                        <div className="d-flex align-items-center gap-2 ms-auto">

                            {vendedor ? <span className="text-white">{identidad}</span> : (
                                <Link to={conectado ? RUTA_PERFIL_CONECTADO : '/perfil'} className="text-white text-decoration-none">
                                    {identidad}
                                </Link>
                            )}

                            <button
                                type="button"
                                className="btn btn-outline-light btn-sm"
                                onClick={manejarCerrarSesion}
                            >
                                Cerrar sesión
                            </button>

                        </div>

                    ) : (

                        <Link
                            to={conectado ? RUTA_LOGIN_CONECTADO : '/login'}
                            className="nav-link text-white ms-auto"
                        >
                            <i className="bi bi-person-circle fs-4 me-1"></i>
                            Iniciar Sesión
                        </Link>

                    )}

                    {!vendedor && <Link
                        to={conectado ? RUTA_CARRITO_CONECTADO : '/carrito'}
                        aria-label={conectado ? 'Carrito conectado' : undefined}
                        className="nav-link text-white position-relative ms-3"
                    >
                        <i className="bi bi-cart3 fs-4"></i>

                        <span className="position-absolute top-5 start-5 translate-middle badge rounded-pill bg-danger">
                            {conectado ? remoto.cantidadTotal : cantidadTotal}
                        </span>
                    </Link>}

                </div>

            </div>

        </nav>
    );
}
