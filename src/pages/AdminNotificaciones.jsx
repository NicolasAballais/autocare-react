import { Link } from 'react-router-dom';
import { obtenerProductos, productoTieneStockCritico } from '../services/productosService';

import { useBaseAdmin } from '../context/catalogo';

import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import { useConsultaCatalogoAdmin } from '../hooks/useConsultaCatalogoAdmin.js';
import { listarProductosAdmin } from '../services/adminCatalogoApi.js';

export default function AdminNotificaciones({ conectado = false }) {
    const baseAdmin = useBaseAdmin();

    const consulta = useConsultaCatalogoAdmin(conectado, listarProductosAdmin);
    const productos = conectado ? consulta.datos ?? [] : obtenerProductos();

    const productosConAlerta = productos.filter(
        (producto) => producto.stock <= 0 || productoTieneStockCritico(producto)
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

            {conectado && <EstadoCatalogoAdmin consulta={consulta} />}
            {(!conectado || consulta.datos) && <div className="card shadow-sm">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h4 className="mb-0">
                            Stock crítico y agotados
                        </h4>

                        <span className="badge text-bg-danger">
                            {productosConAlerta.length}
                        </span>

                    </div>

                    {productosConAlerta.length === 0 ? (

                        <div className="alert alert-success mb-0">

                            <i className="bi bi-check-circle me-2"></i>

                            No existen productos agotados ni con stock crítico.

                        </div>

                    ) : (

                        <div className="list-group">

                            {productosConAlerta.map((producto) => (

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
                                                {producto.stock <= 0 ? 'Agotado' : `Stock actual: ${producto.stock}`}
                                            </p>

                                            <p className="mb-0 text-muted">
                                                Stock crítico: {producto.stockCritico}
                                            </p>

                                        </div>

                                        <Link
                                            to={`${baseAdmin}/productos/editar/${producto.id}`}
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

            </div>}
        </main>
    );
}
