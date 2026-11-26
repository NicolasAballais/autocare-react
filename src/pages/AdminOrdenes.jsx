import { Link } from 'react-router-dom';
import {
    obtenerOrdenes,
    actualizarEstadoOrden
} from '../services/ordenesService';

import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import EstadoEscrituraConectada from '../components/EstadoEscrituraConectada.jsx';
import { useConsultaConectada, useEscrituraConectada } from '../hooks/useOperacionesConectadas.js';
import { formatearRegistro, marcarOrdenEnviadaApi } from '../services/operacionesApi.js';
import { listarOrdenesApi } from '../services/ordenesApi.js';
import { RUTA_ORDENES_CONECTADAS } from '../context/catalogo.js';

export default function AdminOrdenes({ conectado = false }) {
    const consulta = useConsultaConectada(conectado, listarOrdenesApi);
    const escritura = useEscrituraConectada();
    const ordenes = conectado ? (consulta.datos ?? []).map(formatearRegistro) : obtenerOrdenes();

    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });

    const claseEstado = (estado) => {

        switch (estado) {

            case 'Enviado':
                return 'text-bg-primary';

            case 'Entregado':
                return 'text-bg-success';

            case 'Procesando':
            default:
                return 'text-bg-warning';
        }
    };

    const marcarComoEnviado = async (orden) => {

        const confirmar = window.confirm(
            `¿Deseas marcar la orden #${orden.id} como Enviado?`
        );

        if (!confirmar) {
            return;
        }

        if (conectado) {
            if (await escritura.ejecutar(marcarOrdenEnviadaApi, orden.id)) consulta.recargar();
            return;
        }

        actualizarEstadoOrden(
            orden.id,
            'Enviado'
        );

        window.location.reload();
    };

    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Administración de Órdenes
                </h1>

                <p className="text-muted mb-0">
                    Órdenes registradas: {conectado && !consulta.datos ? '—' : ordenes.length}
                </p>

            </div>

            {conectado && <><EstadoCatalogoAdmin consulta={consulta} /><EstadoEscrituraConectada escritura={escritura} /></>}
            {(!conectado || consulta.datos) && (ordenes.length === 0 ? (

                <div className="alert alert-secondary">
                    No existen órdenes registradas.
                </div>

            ) : (

                <div className="card shadow-sm">

                    <div className="card-body">

                        <div className="table-responsive">

                            <table className="table align-middle">

                                <thead>

                                    <tr>

                                        <th>
                                            Orden
                                        </th>

                                        <th>
                                            Fecha
                                        </th>

                                        <th className="text-center">
                                            Productos
                                        </th>

                                        {!conectado && <th>Método de pago</th>}

                                        <th className="text-end">
                                            Total
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

                                    {ordenes.map((orden) => (

                                        <tr key={orden.id}>

                                            <td>
                                                #{orden.id}
                                            </td>

                                            <td>
                                                {orden.fecha}
                                            </td>

                                            <td className="text-center">
                                                {orden.productos.length}
                                            </td>

                                            {!conectado && <td>{orden.metodoPago}</td>}

                                            <td className="text-end fw-bold">
                                                {
                                                    formatoPrecio.format(
                                                        orden.total
                                                    )
                                                }
                                            </td>

                                            <td className="text-center">

                                                <span
                                                    className={`badge ${claseEstado(
                                                        orden.estado
                                                    )}`}
                                                >
                                                    {orden.estado}
                                                </span>

                                            </td>

                                            <td className="text-center">

                                                <div className="d-flex justify-content-center gap-2">

                                                    <Link
                                                        to={`${conectado ? RUTA_ORDENES_CONECTADAS : '/ordenes'}/${orden.id}`}
                                                        className="btn btn-outline-primary btn-sm"
                                                    >
                                                        Ver detalle
                                                    </Link>

                                                    {orden.estado === 'Procesando' && (

                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-success btn-sm"
                                                            disabled={conectado && (!escritura.habilitada || escritura.procesando)}
                                                        onClick={() =>
                                                                marcarComoEnviado(
                                                                    orden
                                                                )
                                                            }
                                                        >
                                                            Marcar enviado
                                                        </button>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            ))}

        </main>
    );
}