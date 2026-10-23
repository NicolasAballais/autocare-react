import { Link } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';

export default function Navbar() {
    const { cantidadTotal } = useCarrito();
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">

                <Link
                    to="/"
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

                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Inicio
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/productos">
                                Productos
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                to="/ordenes"
                            >
                                Mis órdenes
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link
                                to="/admin"
                                className="nav-link"
                            >
                                Administración
                            </Link>
                        </li>

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

                        <li className="nav-item">
                            <Link className="nav-link" to="/contacto">
                                Contacto
                            </Link>
                        </li>

                    </ul>

                    <Link
                        to="/login"
                        className="nav-link text-white ms-auto"
                    >
                        <i className="bi bi-person-circle fs-4 me-1"></i>
                        Iniciar Sesión
                    </Link>

                    <Link
                        to="/carrito"
                        className="nav-link text-white position-relative ms-3"
                    >
                        <i className="bi bi-cart3 fs-4"></i>

                        <span className="position-absolute top-5 start-5 translate-middle badge rounded-pill bg-danger">
                            {cantidadTotal}
                        </span>
                    </Link>

                </div>
            </div>
        </nav>
    );
}