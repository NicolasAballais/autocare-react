import { obtenerProductos, guardarProductos } from '../data/productos';
import { Link } from 'react-router-dom';

export default function AdminProductos() {

    const productos = obtenerProductos();

    const eliminarProducto = (id, nombre) => {

    const confirmar = window.confirm(
        `¿Estás seguro de eliminar el producto "${nombre}"?`
    );

    if (!confirmar) {
        return;
    }

    const productosActualizados = productos.filter(
        (producto) => producto.id !== id
    );

    guardarProductos(productosActualizados);

    window.location.reload();
};

    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });

    return (
        <main className="container my-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h1 className="mb-1">
                        Administración de Productos
                    </h1>

                    <p className="text-muted mb-0">
                        Productos registrados: {productos.length}
                    </p>
                </div>

                <Link
                    to="/admin/productos/nuevo"
                    className="btn btn-danger"
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Nuevo producto
                </Link>

            </div>

            <div className="card shadow-sm">

                <div className="card-body">

                    <div className="table-responsive">

                        <table className="table align-middle">

                            <thead>

                                <tr>

                                    <th>
                                        Código
                                    </th>

                                    <th>
                                        Producto
                                    </th>

                                    <th>
                                        Categoría
                                    </th>

                                    <th className="text-end">
                                        Precio
                                    </th>

                                    <th className="text-center">
                                        Stock
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

                                {productos.map((producto) => {

                                    const stockCritico =
                                        producto.stock <= producto.stockCritico;

                                    return (

                                        <tr key={producto.id}>

                                            <td>
                                                {producto.codigo}
                                            </td>

                                            <td>

                                                <strong>
                                                    {producto.nombre}
                                                </strong>

                                                <div className="small text-muted">
                                                    {producto.descripcion}
                                                </div>

                                            </td>

                                            <td>
                                                {producto.categoria}
                                            </td>

                                            <td className="text-end">

                                                {
                                                    formatoPrecio.format(
                                                        producto.precio
                                                    )
                                                }

                                            </td>

                                            <td className="text-center">
                                                {producto.stock}
                                            </td>

                                            <td className="text-center">

                                                {stockCritico ? (

                                                    <span className="badge text-bg-danger">
                                                        Stock crítico
                                                    </span>

                                                ) : (

                                                    <span className="badge text-bg-success">
                                                        Disponible
                                                    </span>

                                                )}

                                            </td>

                                            <td className="text-center">

                                                <div className="d-flex justify-content-center gap-2">

                                                    <Link
                                                        to={`/admin/productos/editar/${producto.id}`}
                                                        className="btn btn-outline-primary btn-sm"
                                                    >
                                                        Editar
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() =>
                                                            eliminarProducto(
                                                                producto.id,
                                                                producto.nombre
                                                            )
                                                        }
                                                    >
                                                        Eliminar
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </main>
    );
}