import { useState } from 'react';
import { obtenerSesion, actualizarUsuarioPerfil } from '../data/usuarios';

export default function Perfil() {

    const sesion = obtenerSesion();

    const [nombre, setNombre] = useState(sesion?.nombre || '');
    const [apellido, setApellido] = useState(sesion?.apellido || '');
    const [correo, setCorreo] = useState(sesion?.correo || '');
    const [telefono, setTelefono] = useState(sesion?.telefono || '');
    const [comuna, setComuna] = useState(sesion?.comuna || '');
    const [direccion, setDireccion] = useState(sesion?.direccion || '');
    const [mensaje, setMensaje] = useState('');

    if (!sesion) {

        return (
            <main className="container my-5">

                <div className="alert alert-warning">
                    Debes iniciar sesión para ver tu perfil.
                </div>

            </main>
        );
    }

    function manejarEnvio(evento) {

        evento.preventDefault();

        actualizarUsuarioPerfil(
            sesion.id,
            {
                nombre,
                apellido,
                correo,
                telefono,
                comuna,
                direccion
            }
        );

        setMensaje('Perfil actualizado correctamente.');
    }

    return (
        <main className="container my-5">

            <div className="row justify-content-center">

                <div className="col-lg-8">

                    <div className="card shadow-sm">

                        <div className="card-body p-4">

                            <h1 className="mb-1">
                                Mi perfil
                            </h1>

                            <p className="text-muted mb-4">
                                Actualiza tus datos personales y de entrega.
                            </p>

                            {mensaje && (

                                <div className="alert alert-success">
                                    {mensaje}
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
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
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
                                            value={apellido}
                                            onChange={(e) => setApellido(e.target.value)}
                                            required
                                        />

                                    </div>

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Correo electrónico
                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        required
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Teléfono
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        placeholder="Ej: 912345678"
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Comuna
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={comuna}
                                        onChange={(e) => setComuna(e.target.value)}
                                        placeholder="Ej: Puente Alto"
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Dirección
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)}
                                        placeholder="Ej: Avenida Siempre Viva 123"
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-danger"
                                >
                                    Guardar cambios
                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}