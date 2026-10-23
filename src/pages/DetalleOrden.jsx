import { Link, useParams } from 'react-router-dom';
import { obtenerOrdenes } from '../data/ordenes';

export default function DetalleOrden() {

    const { id } = useParams();

    const orden = obtenerOrdenes().find(
        (item) => item.id === Number(id)
    );

    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });

    if (!orden) {
        return (
            <main className="container my-5 text-center">

                <h1>
                    Orden no encontrada
                </h1>

                <Link
                    to="/ordenes"
                    className="btn btn-danger mt-3"
                >
                    Volver a mis órdenes
                </Link>

            </main>
        );
    }

    return (
        <main className="container my-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h1>
                        Orden #{orden.id}
                    </h1>

                    <p className="text-muted mb-0">
                        {orden.fecha}
                    </p>

                </div>

                <span className="badge text-bg-warning">
                    {orden.estado}
                </span>

            </div>

            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <h4 className="mb-3">
                        Productos
                    </h4>

                    {orden.productos.map((producto) => (

                        <div
                            key={producto.id}
                            className="border-bottom py-3"
                        >

                            <div className="d-flex justify-content-between">

                                <div>

                                    <h5>
                                        {producto.nombre}
                                    </h5>

                                    <p className="mb-1">
                                        Precio unitario: {
                                            formatoPrecio.format(
                                                producto.precio
                                            )
                                        }
                                    </p>

                                    <p className="mb-0">
                                        Cantidad: {producto.cantidad}
                                    </p>

                                </div>

                                <strong className="text-danger">
                                    {
                                        formatoPrecio.format(
                                            producto.subtotal
                                        )
                                    }
                                </strong>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

            <div className="row g-4">

                <div className="col-lg-7">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <h4>
                                Datos de entrega
                            </h4>

                            <hr />

                            {orden.cliente ? (

                                <>
                                    <p>
                                        <strong>Nombre:</strong>{' '}
                                        {orden.cliente.nombre}
                                    </p>

                                    <p>
                                        <strong>Correo:</strong>{' '}
                                        {orden.cliente.correo}
                                    </p>

                                    <p>
                                        <strong>Teléfono:</strong>{' '}
                                        {orden.cliente.telefono}
                                    </p>

                                    <p>
                                        <strong>Comuna:</strong>{' '}
                                        {orden.cliente.comuna}
                                    </p>

                                    <p className="mb-0">
                                        <strong>Dirección:</strong>{' '}
                                        {orden.cliente.direccion}
                                    </p>
                                </>

                            ) : (

                                <p className="text-muted mb-0">
                                    Esta orden no tiene datos de entrega registrados.
                                </p>

                            )}

                        </div>

                    </div>

                </div>

                <div className="col-lg-5">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <h4>
                                Resumen
                            </h4>

                            <hr />

                            <p>
                                Método de pago: {orden.metodoPago}
                            </p>

                            <h3 className="text-danger">
                                Total: {
                                    formatoPrecio.format(
                                        orden.total
                                    )
                                }
                            </h3>

                            <div className="d-flex gap-2 mt-3">

                                <Link
                                    to={`/ordenes/${orden.id}/boleta`}
                                    className="btn btn-danger"
                                >
                                    Ver boleta
                                </Link>

                                <Link
                                    to="/ordenes"
                                    className="btn btn-outline-secondary"
                                >
                                    Volver a mis órdenes
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}