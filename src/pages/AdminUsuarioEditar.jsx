import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
    obtenerUsuarioPorId,
    actualizarUsuarioAdmin
} from '../services/usuariosService';


export default function AdminUsuarioEditar() {

    const { id } = useParams();
    const navigate = useNavigate();

    const usuario = obtenerUsuarioPorId(id);

    const [mensajeError, setMensajeError] = useState('');

    const [formulario, setFormulario] = useState({
        nombre: usuario?.nombre || '',
        apellido: usuario?.apellido || '',
        correo: usuario?.correo || '',
        telefono: usuario?.telefono || '',
        comuna: usuario?.comuna || '',
        direccion: usuario?.direccion || ''
    });


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


    function manejarCambio(evento) {

        const { name, value } = evento.target;

        setFormulario({
            ...formulario,
            [name]: value
        });
    }


    function manejarEnvio(evento) {

        evento.preventDefault();

        setMensajeError('');

        const resultado =
            actualizarUsuarioAdmin(
                usuario.id,
                formulario
            );

        if (!resultado.exito) {

            setMensajeError(
                resultado.mensaje
            );

            return;
        }

        navigate(
            `/admin/usuarios/${usuario.id}`
        );
    }


    return (
        <main className="container my-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h1 className="mb-1">
                        Editar Usuario
                    </h1>

                    <p className="text-muted mb-0">
                        Modifica los datos del cliente.
                    </p>

                </div>

                <Link
                    to={`/admin/usuarios/${usuario.id}`}
                    className="btn btn-outline-secondary"
                >
                    Volver
                </Link>

            </div>


            <div className="card shadow-sm">

                <div className="card-body">

                    {mensajeError && (

                        <div className="alert alert-danger">
                            {mensajeError}
                        </div>

                    )}


                    <form onSubmit={manejarEnvio}>

                        <div className="row">

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="nombre"
                                    value={formulario.nombre}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>


                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Apellido
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="apellido"
                                    value={formulario.apellido}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>


                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Correo
                                </label>

                                <input
                                    type="email"
                                    className="form-control"
                                    name="correo"
                                    value={formulario.correo}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>


                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Teléfono
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="telefono"
                                    value={formulario.telefono}
                                    onChange={manejarCambio}
                                />

                            </div>


                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Comuna
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="comuna"
                                    value={formulario.comuna}
                                    onChange={manejarCambio}
                                />

                            </div>


                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Dirección
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="direccion"
                                    value={formulario.direccion}
                                    onChange={manejarCambio}
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Guardar cambios
                        </button>

                    </form>

                </div>

            </div>

        </main>
    );
}