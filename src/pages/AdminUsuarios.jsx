import { Link } from 'react-router-dom';
import { obtenerClientes } from '../data/usuarios';


export default function AdminUsuarios() {

    const clientes = obtenerClientes();


    return (
        <main className="container my-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h1 className="mb-1">
                        Administración de Usuarios
                    </h1>

                    <p className="text-muted mb-0">
                        Clientes registrados: {clientes.length}
                    </p>

                </div>


                <Link
                    to="/admin/usuarios/nuevo"
                    className="btn btn-success"
                >
                    <i className="bi bi-person-plus me-2"></i>
                    Nuevo usuario
                </Link>

            </div>


            {clientes.length === 0 ? (

                <div className="alert alert-info">
                    No existen clientes registrados.
                </div>

            ) : (

                <div className="card shadow-sm">

                    <div className="card-body">

                        <div className="table-responsive">

                            <table className="table align-middle">

                                <thead>

                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Teléfono</th>
                                        <th>Comuna</th>
                                        <th>Acciones</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {clientes.map((cliente) => (

                                        <tr key={cliente.id}>

                                            <td>
                                                {cliente.id}
                                            </td>

                                            <td>
                                                {cliente.nombre} {cliente.apellido}
                                            </td>

                                            <td>
                                                {cliente.correo}
                                            </td>

                                            <td>
                                                {cliente.telefono || '-'}
                                            </td>

                                            <td>
                                                {cliente.comuna || '-'}
                                            </td>

                                            <td>

                                                <div className="d-flex gap-2">

                                                    <Link
                                                        to={`/admin/usuarios/${cliente.id}`}
                                                        className="btn btn-outline-primary btn-sm"
                                                    >
                                                        Ver detalle
                                                    </Link>

                                                    <Link
                                                        to={`/admin/usuarios/${cliente.id}/editar`}
                                                        className="btn btn-outline-secondary btn-sm"
                                                    >
                                                        Editar
                                                    </Link>

                                                </div>

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