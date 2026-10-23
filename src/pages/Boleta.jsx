import { Link, useParams } from 'react-router-dom';
import { obtenerOrdenes } from '../data/ordenes';

export default function Boleta() {

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
                    Boleta no encontrada
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

            <div className="card shadow-sm">

                <div className="card-body p-4">

                    <div className="text-center mb-4">

                        <h2>
                            AutoCare
                            <span className="text-danger">
                                Pro
                            </span>
                        </h2>

                        <p className="mb-1">
                            Boleta de compra
                        </p>

                        <p className="text-muted">
                            Orden #{orden.id}
                        </p>

                    </div>

                    <hr />

                    <div className="row mb-4">

                        <div className="col-md-6">

                            <h5>
                                Datos de la compra
                            </h5>

                            <p className="mb-1">
                                <strong>Fecha:</strong>{' '}
                                {orden.fecha}
                            </p>

                            <p className="mb-1">
                                <strong>Estado:</strong>{' '}
                                {orden.estado}
                            </p>

                            <p className="mb-0">
                                <strong>Método de pago:</strong>{' '}
                                {orden.metodoPago}
                            </p>

                        </div>

                        <div className="col-md-6">

                            <h5>
                                Cliente
                            </h5>

                            {orden.cliente ? (
                                <>
                                    <p className="mb-1">
                                        {orden.cliente.nombre}
                                    </p>

                                    <p className="mb-1">
                                        {orden.cliente.correo}
                                    </p>

                                    <p className="mb-0">
                                        {orden.cliente.direccion},
                                        {' '}
                                        {orden.cliente.comuna}
                                    </p>
                                </>
                            ) : (
                                <p className="text-muted">
                                    Sin datos registrados.
                                </p>
                            )}

                        </div>

                    </div>

                    <div className="table-responsive">

                        <table className="table">

                            <thead>

                                <tr>
                                    <th>
                                        Producto
                                    </th>

                                    <th className="text-center">
                                        Cantidad
                                    </th>

                                    <th className="text-end">
                                        Precio
                                    </th>

                                    <th className="text-end">
                                        Subtotal
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                {orden.productos.map((producto) => (

                                    <tr key={producto.id}>

                                        <td>
                                            {producto.nombre}
                                        </td>

                                        <td className="text-center">
                                            {producto.cantidad}
                                        </td>

                                        <td className="text-end">
                                            {
                                                formatoPrecio.format(
                                                    producto.precio
                                                )
                                            }
                                        </td>

                                        <td className="text-end">
                                            {
                                                formatoPrecio.format(
                                                    producto.subtotal
                                                )
                                            }
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                    <hr />

                    <div className="text-end">

                        <h3 className="text-danger">
                            Total: {
                                formatoPrecio.format(
                                    orden.total
                                )
                            }
                        </h3>

                    </div>

                    <div className="mt-4">

                        <Link
                            to={`/ordenes/${orden.id}`}
                            className="btn btn-outline-secondary"
                        >
                            Volver al detalle
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}