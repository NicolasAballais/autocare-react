import { Link } from 'react-router-dom';

import { obtenerProductos } from '../data/productos';
import { obtenerOrdenes } from '../data/ordenes';
import { obtenerIncidencias } from '../data/incidencias';
import { obtenerCategorias } from '../data/categorias';

export default function AdminPanel() {

    const productos = obtenerProductos();
    const ordenes = obtenerOrdenes();
    const incidencias = obtenerIncidencias();
    const categorias = obtenerCategorias();

    const productosStockCritico = productos.filter(
        (producto) =>
            producto.stock <= producto.stockCritico
    );

    const ordenesProcesando = ordenes.filter(
        (orden) =>
            orden.estado === 'Procesando'
    );

    const incidenciasPendientes = incidencias.filter(
        (incidencia) =>
            incidencia.estado === 'Pendiente'
    );

    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Panel de Administración
                </h1>

                <p className="text-muted">
                    Gestión general de AutoCarePro
                </p>

            </div>

            <div className="row g-4">

                {/* PRODUCTOS */}

                <div className="col-md-6 col-lg">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <i className="bi bi-box-seam fs-2 text-danger"></i>

                                <span className="badge text-bg-secondary">
                                    {productos.length}
                                </span>

                            </div>

                            <h4>
                                Productos
                            </h4>

                            <p className="text-muted">
                                Crear, editar, eliminar y controlar el stock.
                            </p>

                            <Link
                                to="/admin/productos"
                                className="btn btn-danger"
                            >
                                Administrar productos
                            </Link>

                        </div>

                    </div>

                </div>

                {/* CATEGORÍAS */}

                <div className="col-md-6 col-lg">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <i className="bi bi-grid fs-2 text-secondary"></i>

                                <span className="badge text-bg-secondary">
                                    {categorias.length}
                                </span>

                            </div>

                            <h4>
                                Categorías
                            </h4>

                            <p className="text-muted">
                                Crear, editar y organizar categorías.
                            </p>

                            <Link
                                to="/admin/categorias"
                                className="btn btn-outline-secondary"
                            >
                                Administrar categorías
                            </Link>

                        </div>

                    </div>

                </div>

                {/* ÓRDENES */}

                <div className="col-md-6 col-lg">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <i className="bi bi-receipt fs-2 text-primary"></i>

                                <span className="badge text-bg-warning">
                                    {ordenesProcesando.length}
                                </span>

                            </div>

                            <h4>
                                Órdenes
                            </h4>

                            <p className="text-muted">
                                Revisar compras y actualizar su estado.
                            </p>

                            <Link
                                to="/admin/ordenes"
                                className="btn btn-outline-primary"
                            >
                                Administrar órdenes
                            </Link>

                        </div>

                    </div>

                </div>

                {/* NOTIFICACIONES */}

                <div className="col-md-6 col-lg">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <i className="bi bi-bell fs-2 text-danger"></i>

                                <span className="badge text-bg-danger">
                                    {productosStockCritico.length}
                                </span>

                            </div>

                            <h4>
                                Notificaciones
                            </h4>

                            <p className="text-muted">
                                Revisar productos con stock crítico.
                            </p>

                            <Link
                                to="/admin/notificaciones"
                                className="btn btn-outline-danger"
                            >
                                Ver notificaciones
                            </Link>

                        </div>

                    </div>

                </div>

                {/* INCIDENCIAS */}

                <div className="col-md-6 col-lg">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <i className="bi bi-exclamation-circle fs-2 text-warning"></i>

                                <span className="badge text-bg-warning">
                                    {incidenciasPendientes.length}
                                </span>

                            </div>

                            <h4>
                                Incidencias
                            </h4>

                            <p className="text-muted">
                                Revisar y gestionar problemas reportados.
                            </p>

                            <Link
                                to="/admin/incidencias"
                                className="btn btn-outline-warning"
                            >
                                Administrar incidencias
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}