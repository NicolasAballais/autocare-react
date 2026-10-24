import { Link, useLocation } from 'react-router-dom';


export default function CompraExitosa() {

    const location = useLocation();

    const orden = location.state?.orden;


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


    if (!orden) {

        return (
            <main className="container my-5">

                <div className="alert alert-warning">
                    No existe información disponible sobre esta compra.
                </div>

                <Link
                    to="/productos"
                    className="btn btn-danger"
                >
                    Volver a productos
                </Link>

            </main>
        );
    }


    return (
        <main className="container my-5">

            <div className="text-center mb-4">

                <i
                    className="bi bi-check-circle-fill text-success"
                    style={{ fontSize: '4rem' }}
                ></i>

                <h1 className="mt-3">
                    Compra realizada con éxito
                </h1>

                <p className="text-muted">
                    Tu pedido fue registrado correctamente.
                </p>

            </div>


            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <div>

                            <h4 className="mb-1">
                                Resumen de la compra
                            </h4>

                            <small className="text-muted">
                                Orden #{orden.id}
                            </small>

                        </div>

                        <span className="badge text-bg-success">
                            Pago aprobado
                        </span>

                    </div>


                    <div className="row mb-4">

                        <div className="col-md-6 mb-3">

                            <strong>
                                Cliente
                            </strong>

                            <div>
                                {orden.cliente?.nombre || 'No especificado'}
                            </div>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Correo
                            </strong>

                            <div>
                                {orden.cliente?.correo || 'No especificado'}
                            </div>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Teléfono
                            </strong>

                            <div>
                                {orden.cliente?.telefono || 'No especificado'}
                            </div>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Método de entrega
                            </strong>

                            <div>
                                {orden.tipoEntrega || 'No especificado'}
                            </div>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Comuna
                            </strong>

                            <div>
                                {orden.cliente?.comuna || 'No especificada'}
                            </div>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Dirección
                            </strong>

                            <div>
                                {orden.cliente?.direccion || 'No especificada'}
                            </div>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Método de pago
                            </strong>

                            <div>
                                {nombreMetodoPago[orden.metodoPago]
                                    || orden.metodoPago
                                    || 'No especificado'}
                            </div>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Estado de la orden
                            </strong>

                            <div>
                                {orden.estado}
                            </div>

                        </div>

                    </div>


                    <h5 className="mb-3">
                        Productos
                    </h5>


                    <div className="table-responsive">

                        <table className="table align-middle">

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


                    <div className="text-end mt-3">

                        <h4>
                            Total pagado:
                            {' '}
                            <span className="text-success">
                                {formatoPrecio.format(orden.total)}
                            </span>
                        </h4>

                    </div>

                </div>

            </div>


            <div className="d-flex justify-content-center gap-2 flex-wrap">

                <Link
                    to={`/ordenes/${orden.id}`}
                    className="btn btn-primary"
                >
                    Ver orden
                </Link>

                <Link
                    to={`/ordenes/${orden.id}/boleta`}
                    className="btn btn-outline-primary"
                >
                    Ver boleta
                </Link>

                <Link
                    to="/productos"
                    className="btn btn-outline-secondary"
                >
                    Seguir comprando
                </Link>

            </div>

        </main>
    );
}