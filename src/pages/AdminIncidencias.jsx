import { Link } from 'react-router-dom';
import {
    obtenerIncidencias,
    actualizarEstadoIncidencia
} from '../services/incidenciasService';

import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import EstadoEscrituraConectada from '../components/EstadoEscrituraConectada.jsx';
import { useConsultaConectada, useEscrituraConectada } from '../hooks/useOperacionesConectadas.js';
import { formatearRegistro, listarIncidenciasApi, resolverIncidenciaApi } from '../services/operacionesApi.js';
import { RUTA_ORDENES_CONECTADAS } from '../context/catalogo.js';

export default function AdminIncidencias({ conectado = false }) {
    const consulta = useConsultaConectada(conectado, listarIncidenciasApi);
    const escritura = useEscrituraConectada();
    const incidencias = conectado ? (consulta.datos ?? []).map(formatearRegistro) : obtenerIncidencias();

    async function marcarResuelta(id) {

        const confirmar = window.confirm(
            '¿Deseas marcar esta incidencia como resuelta?'
        );

        if (!confirmar) {
            return;
        }

        if (conectado) {
            if (await escritura.ejecutar(resolverIncidenciaApi, id)) consulta.recargar();
            return;
        }

        actualizarEstadoIncidencia(
            id,
            'Resuelta'
        );

        window.location.reload();
    }

    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Administración de Incidencias
                </h1>

                <p className="text-muted mb-0">
                    Incidencias registradas: {conectado && !consulta.datos ? '—' : incidencias.length}
                </p>

            </div>

            {conectado && <><EstadoCatalogoAdmin consulta={consulta} /><EstadoEscrituraConectada escritura={escritura} /></>}
            {(!conectado || consulta.datos) && (incidencias.length === 0 ? (

                <div className="alert alert-info">
                    No existen incidencias registradas.
                </div>

            ) : (

                <div className="card shadow-sm">

                    <div className="card-body">

                        <div className="table-responsive">

                            <table className="table align-middle">

                                <thead>

                                    <tr>
                                        <th>ID</th>
                                        <th>Fecha</th>
                                        <th>Orden</th>
                                        <th>Asunto</th>
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {incidencias.map((incidencia) => (

                                        <tr key={incidencia.id}>

                                            <td>
                                                #{incidencia.id}
                                            </td>

                                            <td>
                                                {incidencia.fecha}
                                            </td>

                                            <td>

                                                <Link
                                                    to={`${conectado ? RUTA_ORDENES_CONECTADAS : '/ordenes'}/${incidencia.ordenId}`}
                                                >
                                                    #{incidencia.ordenId}
                                                </Link>

                                            </td>

                                            <td>
                                                {incidencia.asunto}
                                            </td>

                                            <td>
                                                {incidencia.descripcion}
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        incidencia.estado === 'Resuelta'
                                                            ? 'badge text-bg-success'
                                                            : 'badge text-bg-warning'
                                                    }
                                                >
                                                    {incidencia.estado}
                                                </span>

                                            </td>

                                            <td>

                                                {incidencia.estado === 'Pendiente' && (

                                                    <button
                                                        className="btn btn-outline-success btn-sm"
                                                        disabled={conectado && (!escritura.habilitada || escritura.procesando)}
                                                        onClick={() =>
                                                            marcarResuelta(incidencia.id)
                                                        }
                                                    >
                                                        Marcar resuelta
                                                    </button>

                                                )}

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