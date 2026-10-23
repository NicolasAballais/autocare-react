import { useCarrito } from '../context/CarritoContext';
import { Link } from 'react-router-dom';

export default function Carrito() {

    const {
        carrito,
        cantidadTotal,
        total,
        cambiarCantidad,
        eliminarProducto
    } = useCarrito();

    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });

    return (
        <main className="container my-5">

            <h1 className="mb-4">
                Carrito de Compras
            </h1>

            <p>
                Productos diferentes: {carrito.length}
            </p>

            <p>
                Cantidad total: {cantidadTotal}
            </p>

            <div className="row g-3 mt-3">

                {carrito.map((item) => (

                    <div
                        className="col-12"
                        key={item.id}
                    >

                        <div className="card shadow-sm">

                            <div className="row g-0 align-items-center">

                                <div className="col-md-2">

                                    <img
                                        src={item.imagen}
                                        className="img-fluid rounded-start"
                                        alt={item.nombre}
                                    />

                                </div>

                                <div className="col-md-10">

                                    <div className="card-body">

                                        <h5 className="card-title">
                                            {item.nombre}
                                        </h5>

                                        <p className="mb-1">
                                            Precio: {formatoPrecio.format(item.precio)}
                                        </p>

                                        <div className="d-flex align-items-center gap-2 mb-2">

                                            <label
                                                htmlFor={`cantidad-${item.id}`}
                                                className="mb-0"
                                            >
                                                Cantidad:
                                            </label>

                                            <input
                                                id={`cantidad-${item.id}`}
                                                type="number"
                                                className="form-control form-control-sm"
                                                style={{ width: '80px' }}
                                                min="1"
                                                max={item.stock}
                                                value={item.cantidad}
                                                onChange={(event) =>
                                                    cambiarCantidad(
                                                        item.id,
                                                        Number(event.target.value)
                                                    )
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() =>
                                                    eliminarProducto(item.id)
                                                }
                                            >
                                                Eliminar
                                            </button>

                                        </div>

                                        <p className="fw-bold text-danger mb-0">
                                            Subtotal: {
                                                formatoPrecio.format(
                                                    item.precio * item.cantidad
                                                )
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

            <div className="text-end mt-4">

                <h3>
                    Total: {formatoPrecio.format(total)}
                </h3>

                <Link
                    to="/checkout"
                    className="btn btn-danger mt-3"
                >
                    Continuar al checkout
                </Link>

            </div>
        </main>
    );
}