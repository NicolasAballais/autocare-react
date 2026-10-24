import { obtenerProductos } from '../data/productos';
import { obtenerOrdenes } from '../data/ordenes';
import { obtenerClientes } from '../data/usuarios';
import { obtenerIncidencias } from '../data/incidencias';


export default function AdminReportes() {

    const productos = obtenerProductos();
    const ordenes = obtenerOrdenes();
    const clientes = obtenerClientes();
    const incidencias = obtenerIncidencias();


    const totalVentas = ordenes.reduce(
        (acumulado, orden) =>
            acumulado + orden.total,
        0
    );


    const ordenesProcesando = ordenes.filter(
        (orden) =>
            orden.estado === 'Procesando'
    );


    const ordenesEnviadas = ordenes.filter(
        (orden) =>
            orden.estado === 'Enviado'
    );


    const productosStockCritico = productos.filter(
        (producto) =>
            producto.stock <= producto.stockCritico
    );


    const incidenciasPendientes = incidencias.filter(
        (incidencia) =>
            incidencia.estado === 'Pendiente'
    );


    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Reportes
                </h1>

                <p className="text-muted">
                    Resumen general del funcionamiento de AutoCarePro.
                </p>

            </div>


            {/* INDICADORES PRINCIPALES */}

            <div className="row g-4 mb-4">

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <i className="bi bi-cash-stack fs-2 text-success"></i>

                            <h5 className="mt-3">
                                Ventas acumuladas
                            </h5>

                            <h3>
                                ${totalVentas.toLocaleString('es-CL')}
                            </h3>

                        </div>

                    </div>

                </div>


                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <i className="bi bi-receipt fs-2 text-primary"></i>

                            <h5 className="mt-3">
                                Órdenes
                            </h5>

                            <h3>
                                {ordenes.length}
                            </h3>

                            <small className="text-muted">
                                {ordenesProcesando.length} procesando / {ordenesEnviadas.length} enviadas
                            </small>

                        </div>

                    </div>

                </div>


                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <i className="bi bi-people fs-2 text-success"></i>

                            <h5 className="mt-3">
                                Clientes
                            </h5>

                            <h3>
                                {clientes.length}
                            </h3>

                            <small className="text-muted">
                                Usuarios registrados
                            </small>

                        </div>

                    </div>

                </div>


                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <i className="bi bi-exclamation-triangle fs-2 text-danger"></i>

                            <h5 className="mt-3">
                                Stock crítico
                            </h5>

                            <h3>
                                {productosStockCritico.length}
                            </h3>

                            <small className="text-muted">
                                Productos que requieren atención
                            </small>

                        </div>

                    </div>

                </div>

            </div>


            {/* RESUMEN DE ÓRDENES */}

            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <h4 className="mb-3">
                        Resumen de ventas
                    </h4>

                    {ordenes.length === 0 ? (

                        <div className="alert alert-info mb-0">
                            No existen ventas registradas.
                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table align-middle">

                                <thead>

                                    <tr>
                                        <th>Orden</th>
                                        <th>Fecha</th>
                                        <th>Cliente</th>
                                        <th>Total</th>
                                        <th>Pago</th>
                                        <th>Estado</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {ordenes.map((orden) => (

                                        <tr key={orden.id}>

                                            <td>
                                                #{orden.id}
                                            </td>

                                            <td>
                                                {orden.fecha}
                                            </td>

                                            <td>
                                                {orden.cliente?.nombre || 'Sin información'}
                                            </td>

                                            <td>
                                                ${orden.total.toLocaleString('es-CL')}
                                            </td>

                                            <td>
                                                {orden.metodoPago || '-'}
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        orden.estado === 'Enviado'
                                                            ? 'badge text-bg-success'
                                                            : 'badge text-bg-warning'
                                                    }
                                                >
                                                    {orden.estado}
                                                </span>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>


            {/* ESTADO DE PRODUCTOS */}

            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <h4 className="mb-3">
                        Estado de inventario
                    </h4>

                    <div className="table-responsive">

                        <table className="table align-middle">

                            <thead>

                                <tr>
                                    <th>Código</th>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th>Stock</th>
                                    <th>Stock crítico</th>
                                    <th>Estado</th>
                                </tr>

                            </thead>

                            <tbody>

                                {productos.map((producto) => {

                                    const critico =
                                        producto.stock <= producto.stockCritico;

                                    return (

                                        <tr key={producto.id}>

                                            <td>
                                                {producto.codigo}
                                            </td>

                                            <td>
                                                {producto.nombre}
                                            </td>

                                            <td>
                                                {producto.categoria}
                                            </td>

                                            <td>
                                                {producto.stock}
                                            </td>

                                            <td>
                                                {producto.stockCritico}
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        critico
                                                            ? 'badge text-bg-danger'
                                                            : 'badge text-bg-success'
                                                    }
                                                >
                                                    {critico
                                                        ? 'Crítico'
                                                        : 'Normal'}
                                                </span>

                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>


            {/* INCIDENCIAS */}

            <div className="card shadow-sm">

                <div className="card-body">

                    <h4>
                        Estado de incidencias
                    </h4>

                    <p className="mb-1">
                        Total registradas: <strong>{incidencias.length}</strong>
                    </p>

                    <p className="mb-0">
                        Pendientes: <strong>{incidenciasPendientes.length}</strong>
                    </p>

                </div>

            </div>

        </main>
    );
}