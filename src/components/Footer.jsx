import { Link } from 'react-router-dom';


export default function Footer() {

    return (

        <footer className="bg-dark text-white text-center p-4">

            <div className="container">

                <div className="row justify-content-between">

                    <div className="col-md-5 col-lg-4">

                        <h3>
                            AutoCare
                            <span className="text-danger">
                                Pro
                            </span>
                        </h3>

                        <p>
                            Dirección: Calle Falsa 123, Ciudad, País
                        </p>

                        <p>
                            Teléfono: +1 234 567 890
                        </p>

                    </div>


                    <div className="col-md-5 col-lg-4">

                        <h3>
                            Redes Sociales
                        </h3>

                        <p>
                            Síguenos en nuestras redes sociales para más
                            información y ofertas especiales.
                        </p>


                        <div className="social-icons">

                            <a
                                href="https://www.facebook.com"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Facebook"
                            >
                                <i className="bi bi-facebook fs-2 me-3"></i>
                            </a>


                            <a
                                href="https://x.com"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="X"
                            >
                                <i className="bi bi-twitter fs-2 me-3"></i>
                            </a>


                            <a
                                href="https://www.instagram.com"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Instagram"
                            >
                                <i className="bi bi-instagram fs-2 me-3"></i>
                            </a>


                            <a
                                href="https://www.linkedin.com"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="LinkedIn"
                            >
                                <i className="bi bi-linkedin fs-2"></i>
                            </a>

                        </div>

                    </div>

                </div>

            </div>


            <hr />


            <p>
                &copy; 2024 AutoCare Pro. Todos los derechos reservados.
            </p>


            <div className="mt-2">

                <Link
                    to="/admin"
                    className="text-secondary text-decoration-none small"
                >
                    Ingreso Administrador
                </Link>

            </div>

        </footer>

    );
}