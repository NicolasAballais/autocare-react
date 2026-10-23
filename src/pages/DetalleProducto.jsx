import { Link, useParams } from 'react-router-dom';
import { obtenerProductos } from '../data/productos';
import { useCarrito } from '../context/CarritoContext';

export default function DetalleProducto() {

    const { id } = useParams();

    const { agregarProducto } = useCarrito();

    const producto =
        obtenerProductos().find(
            (producto) =>
                producto.id === Number(id)
        );

    if (!producto) {
        return (
            <main className="container my-5 text-center">

                <h1>
                    Producto no encontrado
                </h1>

                <Link
                    to="/productos"
                    className="btn btn-danger mt-3"
                >
                    Volver al catálogo
                </Link>

            </main>
        );
    }

    const precioFormateado =
        new Intl.NumberFormat(
            'es-CL',
            {
                style: 'currency',
                currency: 'CLP',
                maximumFractionDigits: 0
            }
        ).format(producto.precio);

    return (
        <main className="container my-5">

            <div className="row g-5 align-items-center">

                <div className="col-md-6">

                    <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="img-fluid rounded shadow-sm"
                    />

                </div>

                <div className="col-md-6">

                    <span className="badge text-bg-secondary mb-3">
                        {producto.categoria}
                    </span>

                    <h1>
                        {producto.nombre}
                    </h1>

                    <p className="lead text-muted">
                        {producto.descripcion}
                    </p>

                    <h3 className="text-danger">
                        {precioFormateado}
                    </h3>

                    <p>
                        <strong>Código:</strong>{' '}
                        {producto.codigo}
                    </p>

                    <p>
                        <strong>Stock disponible:</strong>{' '}
                        {producto.stock}
                    </p>

                    <div className="d-flex gap-2 mt-4">

                        <button
                            type="button"
                            className="btn btn-danger"
                            disabled={producto.stock === 0}
                            onClick={() =>
                                agregarProducto(producto)
                            }
                        >
                            <i className="bi bi-cart-plus me-2"></i>
                            Agregar al carrito
                        </button>

                        <Link
                            to="/productos"
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