import { Link } from 'react-router-dom';

import {
    obtenerIncidenciasUsuario
} from '../services/incidenciasService';

import {
    obtenerSesion
} from '../services/usuariosService';

export default function Incidencias() {

    const sesion = obtenerSesion();

    const incidencias = sesion
        ? obtenerIncidenciasUsuario(sesion)
        : [];

    if (!sesion) {

        return (
            <main className="container my-5">

                <div className="alert alert-warning">
                    Debes iniciar sesión para consultar tus incidencias.
                </div>

                <Link
                    to="/login"
                    className="btn btn-danger"
                >
                    Iniciar sesión
                </Link>

            </main>
        );
    }

    return (
        <main className="container my-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h1 className="mb-1">
                        Mis incidencias
                    </h1>

                    <p className="text-muted mb-0">
                        Solicitudes enviadas relacionadas con tus compras.
                    </p>

                </div>

                <Link
                    to="/incidencias/nueva"
                    className="btn btn-danger"
                >
                    Nueva incidencia
                </Link>

            </div>

            {incidencias.length === 0 ? (

                <div className="alert alert-info">
                    No tienes incidencias registradas.
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
                                        <th>Estado</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {incidencias.map(
                                        (incidencia) => (

                                            <tr
                                                key={incidencia.id}
                                            >

                                                <td>
                                                    #{incidencia.id}
                                                </td>

                                                <td>
                                                    {incidencia.fecha}
                                                </td>

                                                <td>
                                                    #{incidencia.ordenId}
                                                </td>

                                                <td>
                                                    {incidencia.asunto}
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

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}