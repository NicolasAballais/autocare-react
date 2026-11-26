import { Link } from 'react-router-dom';

import { obtenerProductos } from '../services/productosService';
import { obtenerOrdenes } from '../services/ordenesService';
import { obtenerIncidencias } from '../services/incidenciasService';
import { obtenerCategorias } from '../services/categoriasService';
import { obtenerClientes } from '../services/usuariosService';


import { RUTA_ORDENES_CONECTADAS, useBaseAdmin } from '../context/catalogo.js';
import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import { useConsultaCatalogoAdmin } from '../hooks/useConsultaCatalogoAdmin.js';
import { listarCategoriasAdmin, listarProductosAdmin } from '../services/adminCatalogoApi.js';
import { useConsultaConectada } from '../hooks/useOperacionesConectadas.js';
import { listarOrdenesApi } from '../services/ordenesApi.js';
import { formatearRegistro, listarClientesApi, listarIncidenciasApi } from '../services/operacionesApi.js';

export default function AdminPanel({ conectado = false }) {
    const baseAdmin = useBaseAdmin();

    const productosApi = useConsultaCatalogoAdmin(conectado, listarProductosAdmin);
    const categoriasApi = useConsultaCatalogoAdmin(conectado, listarCategoriasAdmin);
    const ordenesApi = useConsultaConectada(conectado, listarOrdenesApi);
    const incidenciasApi = useConsultaConectada(conectado, listarIncidenciasApi);
    const clientesApi = useConsultaConectada(conectado, listarClientesApi);
    const productos = conectado ? productosApi.datos : obtenerProductos();
    const ordenes = conectado ? ordenesApi.datos?.map(formatearRegistro) : obtenerOrdenes();
    const incidencias = conectado ? incidenciasApi.datos?.map(formatearRegistro) : obtenerIncidencias();
    const categorias = conectado ? categoriasApi.datos : obtenerCategorias();
    const clientes = conectado ? clientesApi.datos : obtenerClientes();


    const productosStockCritico = productos?.filter(
        (producto) =>
            producto.stock <= producto.stockCritico
    );


    const ordenesProcesando = ordenes?.filter(
        (orden) =>
            orden.estado === 'Procesando'
    );


    const incidenciasPendientes = incidencias?.filter(
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

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <i className="bi bi-box-seam fs-2 text-danger"></i>

                                <span className="badge text-bg-secondary">
                                    {productos?.length ?? '—'}
                                </span>

                            </div>

                            <h4>
                                Productos
                            </h4>
                            <EstadoCatalogoAdmin consulta={productosApi} />

                            <p className="text-muted">
                                Crear, editar, eliminar y controlar el stock.
                            </p>

                            <Link
                                to={`${baseAdmin}/productos`}
                                className="btn btn-danger"
                            >
                                Administrar productos
                            </Link>

                        </div>

                    </div>

                </div>


                {/* CATEGORÍAS */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <i className="bi bi-grid fs-2 text-secondary"></i>

                                <span className="badge text-bg-secondary">
                                    {categorias?.length ?? '—'}
                                </span>

                            </div>

                            <h4>
                                Categorías
                            </h4>
                            <EstadoCatalogoAdmin consulta={categoriasApi} />

                            <p className="text-muted">
                                Crear, editar y organizar categorías.
                            </p>

                            <Link
                                to={`${baseAdmin}/categorias`}
                                className="btn btn-outline-secondary"
                            >
                                Administrar categorías
                            </Link>

                        </div>

                    </div>

                </div>


                {/* ÓRDENES */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <i className="bi bi-receipt fs-2 text-primary"></i>

                                <span className="badge text-bg-warning">
                                    {ordenesProcesando?.length ?? '—'}
                                </span>

                            </div>

                            <h4>
                                Órdenes
                            </h4>
                            <EstadoCatalogoAdmin consulta={ordenesApi} />

                            <p className="text-muted">
                                Revisar compras y actualizar su estado.
                            </p>

                            <Link
                                to={`${baseAdmin}/ordenes`}
                                className="btn btn-outline-primary"
                            >
                                Administrar órdenes
                            </Link>
                            {conectado && <Link className="d-block mt-2" to={RUTA_ORDENES_CONECTADAS}>Ver órdenes conectadas</Link>}

                        </div>

                    </div>

                </div>


                {/* USUARIOS */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <i className="bi bi-people fs-2 text-success"></i>

                                <span className="badge text-bg-secondary">
                                    {clientes?.length ?? '—'}
                                </span>

                            </div>

                            <h4>
                                Usuarios
                            </h4>
                            <EstadoCatalogoAdmin consulta={clientesApi} />

                            <p className="text-muted">
                                Revisar clientes, editar sus datos y consultar su historial.
                            </p>

                            <Link
                                to={`${baseAdmin}/usuarios`}
                                className="btn btn-outline-success"
                            >
                                Administrar usuarios
                            </Link>

                        </div>

                    </div>

                </div>


                {/* NOTIFICACIONES */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <i className="bi bi-bell fs-2 text-danger"></i>

                                <span className="badge text-bg-danger">
                                    {productosStockCritico?.length ?? '—'}
                                </span>

                            </div>

                            <h4>
                                Notificaciones
                            </h4>
                            <EstadoCatalogoAdmin consulta={productosApi} />

                            <p className="text-muted">
                                Revisar productos con stock crítico.
                            </p>

                            <Link
                                to={`${baseAdmin}/notificaciones`}
                                className="btn btn-outline-danger"
                            >
                                Ver notificaciones
                            </Link>

                        </div>

                    </div>

                </div>


                {/* INCIDENCIAS */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <i className="bi bi-exclamation-circle fs-2 text-warning"></i>

                                <span className="badge text-bg-warning">
                                    {incidenciasPendientes?.length ?? '—'}
                                </span>

                            </div>

                            <h4>
                                Incidencias
                            </h4>
                            <EstadoCatalogoAdmin consulta={incidenciasApi} />

                            <p className="text-muted">
                                Revisar y gestionar problemas reportados.
                            </p>

                            <Link
                                to={`${baseAdmin}/incidencias`}
                                className="btn btn-outline-warning"
                            >
                                Administrar incidencias
                            </Link>

                        </div>

                    </div>

                </div>


                {/* REPORTES */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <div className="mb-3">

                                <i className="bi bi-bar-chart-line fs-2 text-info"></i>

                            </div>

                            <h4>
                                Reportes
                            </h4>

                            <p className="text-muted">
                                Consultar ventas, inventario y estadísticas generales.
                            </p>

                            <Link
                                to={`${baseAdmin}/reportes`}
                                className="btn btn-outline-info"
                            >
                                Ver reportes
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}
