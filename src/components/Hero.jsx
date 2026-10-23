import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Hero() {

    const [busqueda, setBusqueda] = useState('');
    const navigate = useNavigate();

    const manejarBusqueda = (event) => {
        event.preventDefault();

        const texto = busqueda.trim();

        if (texto) {
            navigate(`/productos?buscar=${encodeURIComponent(texto)}`);
        } else {
            navigate('/productos');
        }
    };

    return (
        <section className="container text-center my-5 bg-dark-custom p-5 rounded shadow">

            <h1>
                Bienvenido a AutoCare
                <span className="text-danger">Pro</span>
            </h1>

            <p className="lead">
                Tu tienda online de confianza para repuestos y mantenimiento preventivo.
            </p>

            <div className="row justify-content-center mb-4">
                <div className="col-md-8">

                    <form
                        className="d-flex"
                        onSubmit={manejarBusqueda}
                    >
                        <input
                            className="form-control form-control-lg me-2"
                            type="search"
                            id="busquedaInicio"
                            value={busqueda}
                            onChange={(event) => setBusqueda(event.target.value)}
                            placeholder="Busca repuestos, aceites, accesorios..."
                            aria-label="Buscar productos"
                        />

                        <button
                            className="btn btn-danger btn-lg"
                            type="submit"
                        >
                            Buscar
                        </button>
                    </form>

                </div>
            </div>

            <div className="row align-items-center mt-4">

                <div className="col-md-5">

                    <h2 className="p-3">
                        Kits de Limpieza y Detailing en Oferta
                    </h2>

                    <Link
                        to="/productos"
                        className="btn btn-danger p-3 m-3 fs-5"
                    >
                        Ver catálogo completo
                    </Link>

                </div>

                <div className="col-md-7">
                    <img
                        src="/images/Tienda.png"
                        className="img-fluid rounded"
                        alt="Tienda online AutoCare Pro"
                    />
                </div>

            </div>

        </section>
    );
}