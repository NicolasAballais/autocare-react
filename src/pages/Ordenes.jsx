import { Link } from 'react-router-dom';

import {
    obtenerOrdenesUsuario
} from '../data/ordenes';

import {
    obtenerSesion
} from '../data/usuarios';

export default function Ordenes() {

    const sesion = obtenerSesion();

    const ordenes = sesion
        ? obtenerOrdenesUsuario(sesion)
        : [];

    const formatoPrecio =
        new Intl.NumberFormat(
            'es-CL',
            {
                style: 'currency',
                currency: 'CLP',
                maximumFractionDigits: 0
            }
        );

    if (!sesion) {

        return (
            <main className="container my-5">

                <div className="alert alert-warning">

                    Debes iniciar sesión para consultar tus órdenes.

                </div>

                <Link
                    to="/login"
                    className="btn btn-danger"
                >
                    Iniciar sesión
                </Link>

            </main>
        );
    }

    return (
        <main className="container my-5">

            <h1 className="mb-4">
                Mis órdenes
            </h1>

            {ordenes.length === 0 ? (

                <div className="alert alert-info">
                    No tienes órdenes registradas.
                </div>

            ) : (

                <div className="row g-3">

                    {ordenes.map((orden) => (

                        <div
                            className="col-12"
                            key={orden.id}
                        >

                            <div className="card shadow-sm">

                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>

                                            <h5 className="mb-1">
                                                Orden #{orden.id}
                                            </h5>

                                            <p className="text-muted mb-0">
                                                {orden.fecha}
                                            </p>

                                        </div>

                                        <span
                                            className={
                                                orden.estado === 'Enviado'
                                                    ? 'badge text-bg-primary'
                                                    : 'badge text-bg-warning'
                                            }
                                        >
                                            {orden.estado}
                                        </span>

                                    </div>

                                    <hr />

                                    <p>
                                        Productos: {orden.productos.length}
                                    </p>

                                    <p>
                                        Método de pago: {orden.metodoPago}
                                    </p>

                                    <h5 className="text-danger">
                                        Total: {
                                            formatoPrecio.format(
                                                orden.total
                                            )
                                        }
                                    </h5>

                                    <Link
                                        to={`/ordenes/${orden.id}`}
                                        className="btn btn-outline-dark btn-sm mt-2"
                                    >
                                        Ver detalle
                                    </Link>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </main>
    );
}