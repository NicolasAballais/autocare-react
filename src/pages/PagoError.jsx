import { Link, useLocation, useNavigate } from 'react-router-dom';


export default function PagoError() {

    const location = useLocation();
    const navigate = useNavigate();

    const {
        cliente,
        productos,
        total,
        metodoPago,
        tipoEntrega
    } = location.state || {};


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


    function volverAPagar() {

        navigate('/pago', {

            state: {
                datosCliente: cliente,
                tipoEntrega
            }

        });
    }


    if (!productos || productos.length === 0) {

        return (
            <main className="container my-5">

                <div className="alert alert-warning">
                    No existe información disponible sobre este intento de pago.
                </div>

                <Link
                    to="/carrito"
                    className="btn btn-danger"
                >
                    Volver al carrito
                </Link>

            </main>
        );
    }


    return (
        <main className="container my-5">

            <div className="text-center mb-4">

                <i
                    className="bi bi-x-circle-fill text-danger"
                    style={{ fontSize: '4rem' }}
                ></i>

                <h1 className="mt-3">
                    No fue posible procesar el pago
                </h1>

                <p className="text-muted">
                    La compra no fue registrada y los productos continúan en tu carrito.
                </p>

            </div>


            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h4 className="mb-0">
                            Resumen del intento de compra
                        </h4>

                        <span className="badge text-bg-danger">
                            Pago rechazado
                        </span>

                    </div>


                    <div className="row mb-4">

                        <div className="col-md-6 mb-3">

                            <strong>
                                Cliente
                            </strong>

                            <div>
                                {cliente?.nombre || 'No especificado'}
                            </div>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Correo
                            </strong>

                            <div>
                                {cliente?.correo || 'No especificado'}
                            </div>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Teléfono
                            </strong>

                            <div>
                                {cliente?.telefono || 'No especificado'}
                            </div>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Método de entrega
                            </strong>

                            <div>
                                {tipoEntrega || 'No especificado'}
                            </div>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Comuna
                            </strong>

                            <div>
                                {cliente?.comuna || 'No especificada'}
                            </div>

                        </div>


                        <div className="col-md-6 mb-3">

                            <strong>
                                Dirección
                            </strong>

                            <div>
                                {cliente?.direccion || 'No especificada'}
                            </div>

                        </div>


                        <div className="col-md-6">

                            <strong>
                                Método de pago
                            </strong>

                            <div>
                                {nombreMetodoPago[metodoPago] || metodoPago || 'No especificado'}
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

                                {productos.map((producto) => (

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
                            Total:
                            {' '}
                            <span className="text-danger">
                                {formatoPrecio.format(total)}
                            </span>
                        </h4>

                    </div>

                </div>

            </div>


            <div className="d-flex justify-content-center gap-2">

                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={volverAPagar}
                >
                    Volver a intentar el pago
                </button>

                <Link
                    to="/carrito"
                    className="btn btn-outline-secondary"
                >
                    Volver al carrito
                </Link>

            </div>

        </main>
    );
}