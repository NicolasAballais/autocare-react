import {Link} from 'react-router-dom';

export default function Navbar() {
    return (    
    <div>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">      
                <h3 class="text-white">AutoCare <h3 class="text-danger me-3">Pro</h3></h3>
                <button 
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                class="navbar-toggler"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <Link className="nav-link" to="/">Inicio</Link>
                        </li>
                        <li class="nav-item">
                            <Link className="nav-link" to="/productos">Productos</Link>
                        </li>
                        <li class="nav-item">
                            <Link className="nav-link" to="/nosotros">Nosotros</Link>
                        </li>
                        <li class="nav-item">
                            <Link className="nav-link" to="/blog">Blog</Link>
                        </li>
                        <li class="nav-item">
                            <Link className="nav-link" to="/contacto">Contacto</Link>
                        </li>
                    </ul>
                    
                    <a href="login.html" class="nav-link text-white ms-auto ">
                        <i class="bi bi-person-circle fs-4"></i>
                        Iniciar Sesión
                    </a>
                    
                    <a href="carrito.html" class="nav-link text-white position-relative ms-3">
                        <i class="bi bi-cart3 fs-4"></i>
                        <span class="position-absolute top-5 start-5 translate-middle badge rounded-pill bg-danger">
                            0
                        </span>
                    </a>
                </div>
            </div>
        </nav>

    </div>
    );
}