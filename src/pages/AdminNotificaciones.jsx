import { Link } from 'react-router-dom';
import { obtenerProductos } from '../data/productos';

export default function AdminNotificaciones() {

    const productos = obtenerProductos();

    const productosStockCritico = productos.filter(
        (producto) =>
            producto.stock <= producto.stockCritico
    );

    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Notificaciones
                </h1>

                <p className="text-muted mb-0">
                    Alertas administrativas del sistema
                </p>

            </div>

            <div className="card shadow-sm">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h4 className="mb-0">
                            Stock crítico
                        </h4>

                        <span className="badge text-bg-danger">
                            {productosStockCritico.length}
                        </span>

                    </div>

                    {productosStockCritico.length === 0 ? (

                        <div className="alert alert-success mb-0">

                            <i className="bi bi-check-circle me-2"></i>

                            No existen productos con stock crítico.

                        </div>

                    ) : (

                        <div className="list-group">

                            {productosStockCritico.map((producto) => (

                                <div
                                    key={producto.id}
                                    className="list-group-item"
                                >

                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>

                                            <h5 className="mb-1">
                                                {producto.nombre}
                                            </h5>

                                            <p className="mb-1">
                                                Código: {producto.codigo}
                                            </p>

                                            <p className="mb-0 text-danger fw-bold">
                                                Stock actual: {producto.stock}
                                            </p>

                                            <p className="mb-0 text-muted">
                                                Stock crítico: {producto.stockCritico}
                                            </p>

                                        </div>

                                        <Link
                                            to={`/admin/productos/editar/${producto.id}`}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            Editar producto
                                        </Link>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

        </main>
    );
}