import { Link, useParams } from 'react-router-dom';

import {
    obtenerUsuarioPorId
} from '../services/usuariosService';

import {
    obtenerOrdenesUsuario
} from '../services/ordenesService';

export default function AdminUsuarioDetalle() {

    const { id } = useParams();

    const usuario = obtenerUsuarioPorId(id);

    if (!usuario || usuario.rol !== 'cliente') {

        return (
            <main className="container my-5">

                <div className="alert alert-danger">
                    Usuario no encontrado.
                </div>

                <Link
                    to="/admin/usuarios"
                    className="btn btn-secondary"
                >
                    Volver a usuarios
                </Link>

            </main>
        );
    }

    const ordenes =
        obtenerOrdenesUsuario(usuario);

    return (
        <main className="container my-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h1 className="mb-1">
                        Detalle del Usuario
                    </h1>

                    <p className="text-muted mb-0">
                        Información e historial de compras del cliente.
                    </p>

                </div>

                <Link
                    to="/admin/usuarios"
                    className="btn btn-outline-secondary"
                >
                    Volver
                </Link>

            </div>


            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <h4 className="mb-3">
                        Datos personales
                    </h4>

                    <div className="row">

                        <div className="col-md-6 mb-3">

                            <strong>Nombre:</strong>

                            <div>
                                {usuario.nombre} {usuario.apellido}
                            </div>

                        </div>

                        <div className="col-md-6 mb-3">

                            <strong>Correo:</strong>

                            <div>
                                {usuario.correo}
                            </div>

                        </div>

                        <div className="col-md-6 mb-3">

                            <strong>Teléfono:</strong>

                            <div>
                                {usuario.telefono || 'No registrado'}
                            </div>

                        </div>

                        <div className="col-md-6 mb-3">

                            <strong>Comuna:</strong>

                            <div>
                                {usuario.comuna || 'No registrada'}
                            </div>

                        </div>

                        <div className="col-12">

                            <strong>Dirección:</strong>

                            <div>
                                {usuario.direccion || 'No registrada'}
                            </div>

                        </div>

                    </div>

                    <div className="mt-3">

                        <Link
                            to={`/admin/usuarios/${usuario.id}/editar`}
                            className="btn btn-outline-primary"
                        >
                            Editar usuario
                        </Link>

                    </div>

                </div>

            </div>


            <div className="card shadow-sm">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h4 className="mb-0">
                            Historial de compras
                        </h4>

                        <span className="badge text-bg-secondary">
                            {ordenes.length} órdenes
                        </span>

                    </div>


                    {ordenes.length === 0 ? (

                        <div className="alert alert-info mb-0">

                            Este cliente todavía no tiene compras registradas.

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table align-middle">

                                <thead>

                                    <tr>
                                        <th>Orden</th>
                                        <th>Fecha</th>
                                        <th>Total</th>
                                        <th>Pago</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
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

                                            <td>

                                                <Link
                                                    to={`/ordenes/${orden.id}`}
                                                    className="btn btn-outline-primary btn-sm"
                                                >
                                                    Ver orden
                                                </Link>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </main>
    );
}