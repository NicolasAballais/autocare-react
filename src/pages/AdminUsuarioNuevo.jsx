import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
    registrarUsuario
} from '../data/usuarios';


export default function AdminUsuarioNuevo() {

    const navigate = useNavigate();

    const [mensajeError, setMensajeError] = useState('');

    const [formulario, setFormulario] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        password: '',
        telefono: '',
        comuna: '',
        direccion: ''
    });


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
            registrarUsuario({
                nombre: formulario.nombre.trim(),
                apellido: formulario.apellido.trim(),
                correo: formulario.correo.trim(),
                password: formulario.password,
                telefono: formulario.telefono.trim(),
                comuna: formulario.comuna.trim(),
                direccion: formulario.direccion.trim()
            });


        if (!resultado.exito) {

            setMensajeError(
                resultado.mensaje
            );

            return;
        }


        navigate('/admin/usuarios');
    }


    return (
        <main className="container my-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h1 className="mb-1">
                        Nuevo Usuario
                    </h1>

                    <p className="text-muted mb-0">
                        Registra un nuevo cliente en AutoCarePro.
                    </p>

                </div>


                <Link
                    to="/admin/usuarios"
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

                        <div className="row g-3">

                            <div className="col-md-6">

                                <label
                                    htmlFor="nombre"
                                    className="form-label"
                                >
                                    Nombre
                                </label>

                                <input
                                    id="nombre"
                                    type="text"
                                    name="nombre"
                                    className="form-control"
                                    value={formulario.nombre}
                                    onChange={manejarCambio}
                                    maxLength="50"
                                    required
                                />

                            </div>


                            <div className="col-md-6">

                                <label
                                    htmlFor="apellido"
                                    className="form-label"
                                >
                                    Apellido
                                </label>

                                <input
                                    id="apellido"
                                    type="text"
                                    name="apellido"
                                    className="form-control"
                                    value={formulario.apellido}
                                    onChange={manejarCambio}
                                    maxLength="100"
                                    required
                                />

                            </div>


                            <div className="col-md-6">

                                <label
                                    htmlFor="correo"
                                    className="form-label"
                                >
                                    Correo
                                </label>

                                <input
                                    id="correo"
                                    type="email"
                                    name="correo"
                                    className="form-control"
                                    value={formulario.correo}
                                    onChange={manejarCambio}
                                    maxLength="100"
                                    required
                                />

                            </div>


                            <div className="col-md-6">

                                <label
                                    htmlFor="password"
                                    className="form-label"
                                >
                                    Contraseña
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    value={formulario.password}
                                    onChange={manejarCambio}
                                    minLength="4"
                                    maxLength="10"
                                    required
                                />

                            </div>


                            <div className="col-md-6">

                                <label
                                    htmlFor="telefono"
                                    className="form-label"
                                >
                                    Teléfono
                                </label>

                                <input
                                    id="telefono"
                                    type="text"
                                    name="telefono"
                                    className="form-control"
                                    value={formulario.telefono}
                                    onChange={manejarCambio}
                                />

                            </div>


                            <div className="col-md-6">

                                <label
                                    htmlFor="comuna"
                                    className="form-label"
                                >
                                    Comuna
                                </label>

                                <input
                                    id="comuna"
                                    type="text"
                                    name="comuna"
                                    className="form-control"
                                    value={formulario.comuna}
                                    onChange={manejarCambio}
                                />

                            </div>


                            <div className="col-12">

                                <label
                                    htmlFor="direccion"
                                    className="form-label"
                                >
                                    Dirección
                                </label>

                                <input
                                    id="direccion"
                                    type="text"
                                    name="direccion"
                                    className="form-control"
                                    value={formulario.direccion}
                                    onChange={manejarCambio}
                                    maxLength="300"
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="btn btn-success mt-4"
                        >
                            Crear usuario
                        </button>

                    </form>

                </div>

            </div>

        </main>
    );
}