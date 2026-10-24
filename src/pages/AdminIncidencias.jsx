import { Link } from 'react-router-dom';
import {
    obtenerIncidencias,
    actualizarEstadoIncidencia
} from '../services/incidenciasService';

export default function AdminIncidencias() {

    const incidencias = obtenerIncidencias();

    function marcarResuelta(id) {

        const confirmar = window.confirm(
            '¿Deseas marcar esta incidencia como resuelta?'
        );

        if (!confirmar) {
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
                    Incidencias registradas: {incidencias.length}
                </p>

            </div>

            {incidencias.length === 0 ? (

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
                                                    to={`/ordenes/${incidencia.ordenId}`}
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

            )}

        </main>
    );
}