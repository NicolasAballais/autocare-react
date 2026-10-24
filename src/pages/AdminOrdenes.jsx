import { Link } from 'react-router-dom';
import {
    obtenerOrdenes,
    actualizarEstadoOrden
} from '../services/ordenesService';

export default function AdminOrdenes() {

    const ordenes = obtenerOrdenes();

    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });

    const claseEstado = (estado) => {

        switch (estado) {

            case 'Enviado':
                return 'text-bg-primary';

            case 'Entregado':
                return 'text-bg-success';

            case 'Procesando':
            default:
                return 'text-bg-warning';
        }
    };

    const marcarComoEnviado = (orden) => {

        const confirmar = window.confirm(
            `¿Deseas marcar la orden #${orden.id} como Enviado?`
        );

        if (!confirmar) {
            return;
        }

        actualizarEstadoOrden(
            orden.id,
            'Enviado'
        );

        window.location.reload();
    };

    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Administración de Órdenes
                </h1>

                <p className="text-muted mb-0">
                    Órdenes registradas: {ordenes.length}
                </p>

            </div>

            {ordenes.length === 0 ? (

                <div className="alert alert-secondary">
                    No existen órdenes registradas.
                </div>

            ) : (

                <div className="card shadow-sm">

                    <div className="card-body">

                        <div className="table-responsive">

                            <table className="table align-middle">

                                <thead>

                                    <tr>

                                        <th>
                                            Orden
                                        </th>

                                        <th>
                                            Fecha
                                        </th>

                                        <th className="text-center">
                                            Productos
                                        </th>

                                        <th>
                                            Método de pago
                                        </th>

                                        <th className="text-end">
                                            Total
                                        </th>

                                        <th className="text-center">
                                            Estado
                                        </th>

                                        <th className="text-center">
                                            Acciones
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {ordenes.map((orden) => (

                                        <tr key={orden.id}>

                                            <td>
                                                #{orden.id}
                                            </td>

                                            <td>
                                                {orden.fecha}
                                            </td>

                                            <td className="text-center">
                                                {orden.productos.length}
                                            </td>

                                            <td>
                                                {orden.metodoPago}
                                            </td>

                                            <td className="text-end fw-bold">
                                                {
                                                    formatoPrecio.format(
                                                        orden.total
                                                    )
                                                }
                                            </td>

                                            <td className="text-center">

                                                <span
                                                    className={`badge ${claseEstado(
                                                        orden.estado
                                                    )}`}
                                                >
                                                    {orden.estado}
                                                </span>

                                            </td>

                                            <td className="text-center">

                                                <div className="d-flex justify-content-center gap-2">

                                                    <Link
                                                        to={`/ordenes/${orden.id}`}
                                                        className="btn btn-outline-primary btn-sm"
                                                    >
                                                        Ver detalle
                                                    </Link>

                                                    {orden.estado === 'Procesando' && (

                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-success btn-sm"
                                                            onClick={() =>
                                                                marcarComoEnviado(
                                                                    orden
                                                                )
                                                            }
                                                        >
                                                            Marcar enviado
                                                        </button>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}