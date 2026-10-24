import { Link } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';


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


    const ahorroTotal = carrito.reduce(
        (acumulado, item) => {

            if (
                !item.descuento ||
                !item.precioOriginal
            ) {
                return acumulado;
            }

            const ahorroUnitario =
                item.precioOriginal -
                item.precio;

            return acumulado +
                ahorroUnitario *
                item.cantidad;
        },
        0
    );


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


            {carrito.length === 0 ? (

                <div className="alert alert-info mt-4">

                    <h5 className="mb-2">
                        Tu carrito está vacío
                    </h5>

                    <p className="mb-3">
                        Agrega productos antes de continuar con la compra.
                    </p>

                    <Link
                        to="/productos"
                        className="btn btn-danger"
                    >
                        Ver productos
                    </Link>

                </div>

            ) : (

                <>
                    <div className="row g-3 mt-3">

                        {carrito.map((item) => {

                            const tieneOferta =
                                item.descuento > 0
                                &&
                                item.precioOriginal
                                &&
                                item.precioOriginal >
                                item.precio;


                            return (

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
                                                    style={{
                                                        maxHeight: '180px',
                                                        objectFit: 'contain'
                                                    }}
                                                />

                                            </div>


                                            <div className="col-md-10">

                                                <div className="card-body">

                                                    <div className="d-flex align-items-center gap-2 mb-2">

                                                        <h5 className="card-title mb-0">
                                                            {item.nombre}
                                                        </h5>


                                                        {tieneOferta && (

                                                            <span className="badge text-bg-danger">
                                                                -{item.descuento}%
                                                            </span>

                                                        )}

                                                    </div>


                                                    {tieneOferta ? (

                                                        <div className="mb-2">

                                                            <div>

                                                                <span className="text-muted">
                                                                    Precio original:{' '}
                                                                </span>

                                                                <span className="text-muted text-decoration-line-through">
                                                                    {
                                                                        formatoPrecio.format(
                                                                            item.precioOriginal
                                                                        )
                                                                    }
                                                                </span>

                                                            </div>


                                                            <div>

                                                                <span>
                                                                    Precio oferta:{' '}
                                                                </span>

                                                                <strong className="text-danger">
                                                                    {
                                                                        formatoPrecio.format(
                                                                            item.precio
                                                                        )
                                                                    }
                                                                </strong>

                                                            </div>


                                                            <small className="text-success">
                                                                Ahorras{' '}
                                                                {
                                                                    formatoPrecio.format(
                                                                        item.precioOriginal -
                                                                        item.precio
                                                                    )
                                                                }{' '}
                                                                por unidad
                                                            </small>

                                                        </div>

                                                    ) : (

                                                        <p className="mb-2">

                                                            Precio:{' '}

                                                            <strong>
                                                                {
                                                                    formatoPrecio.format(
                                                                        item.precio
                                                                    )
                                                                }
                                                            </strong>

                                                        </p>

                                                    )}


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
                                                            style={{
                                                                width: '80px'
                                                            }}
                                                            min="1"
                                                            max={item.stock}
                                                            step="1"
                                                            value={item.cantidad}
                                                            onChange={(event) =>
                                                                cambiarCantidad(
                                                                    item.id,
                                                                    Number(
                                                                        event.target.value
                                                                    )
                                                                )
                                                            }
                                                        />


                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() =>
                                                                eliminarProducto(
                                                                    item.id
                                                                )
                                                            }
                                                        >
                                                            Eliminar
                                                        </button>

                                                    </div>


                                                    <p className="fw-bold text-danger mb-0">

                                                        Subtotal:{' '}

                                                        {
                                                            formatoPrecio.format(
                                                                item.precio *
                                                                item.cantidad
                                                            )
                                                        }

                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            );

                        })}

                    </div>


                    <div className="text-end mt-4">

                        {ahorroTotal > 0 && (

                            <p className="text-success mb-1">

                                <strong>
                                    Ahorro total:{' '}
                                    {
                                        formatoPrecio.format(
                                            ahorroTotal
                                        )
                                    }
                                </strong>

                            </p>

                        )}


                        <h3>
                            Total:{' '}
                            {formatoPrecio.format(total)}
                        </h3>


                        <Link
                            to="/checkout"
                            className="btn btn-danger mt-3"
                        >
                            Continuar al checkout
                        </Link>

                    </div>
                </>

            )}

        </main>
    );
}