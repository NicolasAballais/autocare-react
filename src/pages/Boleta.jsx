import { Link, useParams } from 'react-router-dom';

import {
    obtenerOrdenes,
    ordenPerteneceAUsuario
} from '../services/ordenesService';

import {
    obtenerSesion
} from '../services/usuariosService';


export default function Boleta() {

    const { id } = useParams();

    const sesion = obtenerSesion();

    const orden = obtenerOrdenes().find(
        (item) => item.id === Number(id)
    );


    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });


    const nombreMetodoPago = {
        credito: 'Tarjeta de crédito',
        debito: 'Tarjeta de débito',
        transferencia: 'Transferencia bancaria'
    };


    if (!sesion) {

        return (
            <main className="container my-5 text-center">

                <div className="alert alert-warning">
                    Debes iniciar sesión para consultar una boleta.
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


    if (
        !orden ||
        !ordenPerteneceAUsuario(
            orden,
            sesion
        )
    ) {

        return (
            <main className="container my-5 text-center">

                <h1>
                    Boleta no disponible
                </h1>

                <p className="text-muted">
                    La boleta no existe o no tienes permiso para consultarla.
                </p>

                <Link
                    to={
                        sesion.rol === 'admin'
                            ? '/admin/ordenes'
                            : '/ordenes'
                    }
                    className="btn btn-danger mt-3"
                >
                    Volver
                </Link>

            </main>
        );
    }


    return (
        <main className="container my-5">

            <div className="card shadow-sm">

                <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-start mb-4">

                        <div>

                            <h1 className="mb-1">
                                Boleta AutoCarePro
                            </h1>

                            <p className="text-muted mb-0">
                                Comprobante de compra
                            </p>

                        </div>

                        <div className="text-end">

                            <strong>
                                Orden #{orden.id}
                            </strong>

                            <div className="text-muted">
                                {orden.fecha}
                            </div>

                        </div>

                    </div>


                    <hr />


                    <div className="row mb-4">

                        <div className="col-md-6">

                            <h5>
                                Cliente
                            </h5>

                            <p className="mb-1">
                                {orden.cliente?.nombre || 'No especificado'}
                            </p>

                            <p className="mb-1">
                                {orden.cliente?.correo || 'No especificado'}
                            </p>

                            <p className="mb-0">
                                {orden.cliente?.telefono || 'No especificado'}
                            </p>

                        </div>


                        <div className="col-md-6">

                            <h5>
                                Entrega
                            </h5>

                            <p className="mb-1">
                                {orden.cliente?.direccion || 'No especificada'}
                            </p>

                            <p className="mb-1">
                                {orden.cliente?.comuna || 'No especificada'}
                            </p>

                            <p className="mb-0">
                                {orden.tipoEntrega || 'No especificada'}
                            </p>

                        </div>

                    </div>


                    <div className="table-responsive">

                        <table className="table">

                            <thead>

                                <tr>
                                    <th>Producto</th>
                                    <th>Precio</th>
                                    <th>Cantidad</th>
                                    <th>Subtotal</th>
                                </tr>

                            </thead>

                            <tbody>

                                {orden.productos.map((producto) => (

                                    <tr key={producto.id}>

                                        <td>
                                            {producto.nombre}
                                        </td>

                                        <td>
                                            {formatoPrecio.format(producto.precio)}
                                        </td>

                                        <td>
                                            {producto.cantidad}
                                        </td>

                                        <td>
                                            {formatoPrecio.format(producto.subtotal)}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>


                    <div className="row mt-4">

                        <div className="col-md-6">

                            <p className="mb-1">

                                <strong>
                                    Método de pago:
                                </strong>{' '}

                                {nombreMetodoPago[orden.metodoPago]
                                    || orden.metodoPago
                                    || 'No especificado'}

                            </p>

                            <p className="mb-0">

                                <strong>
                                    Estado:
                                </strong>{' '}

                                {orden.estado}

                            </p>

                        </div>


                        <div className="col-md-6 text-md-end">

                            <h3>
                                Total:
                                {' '}
                                <span className="text-danger">
                                    {formatoPrecio.format(orden.total)}
                                </span>
                            </h3>

                        </div>

                    </div>


                    <hr />


                    <div className="d-flex justify-content-center gap-2">

                        <Link
                            to={`/ordenes/${orden.id}`}
                            className="btn btn-outline-primary"
                        >
                            Volver a la orden
                        </Link>

                        <Link
                            to={
                                sesion.rol === 'admin'
                                    ? '/admin/ordenes'
                                    : '/ordenes'
                            }
                            className="btn btn-outline-secondary"
                        >
                            Volver
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}