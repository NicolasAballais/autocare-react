import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../data/usuarios';

export default function Register() {

    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [mensaje, setMensaje] = useState('');

    function manejarRegistro(evento) {

        evento.preventDefault();

        setMensaje('');

        if (password !== confirmarPassword) {
            setMensaje('Las contraseñas no coinciden.');
            return;
        }

        const resultado = registrarUsuario({
            nombre,
            apellido,
            correo,
            password
        });

        if (!resultado.exito) {
            setMensaje(resultado.mensaje);
            return;
        }

        navigate('/login');
    }

    return (
        <main className="container my-5">

            <div className="row justify-content-center">

                <div className="col-md-7 col-lg-6">

                    <div className="card shadow-sm">

                        <div className="card-body p-4">

                            <h1 className="mb-1">
                                Crear cuenta
                            </h1>

                            <p className="text-muted mb-4">
                                Regístrate para gestionar tus compras en AutoCarePro.
                            </p>

                            {mensaje && (

                                <div className="alert alert-danger">
                                    {mensaje}
                                </div>

                            )}

                            <form onSubmit={manejarRegistro}>

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
                                        Contraseña
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Confirmar contraseña
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        value={confirmarPassword}
                                        onChange={(e) => setConfirmarPassword(e.target.value)}
                                        required
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-danger w-100"
                                >
                                    Crear cuenta
                                </button>

                            </form>

                            <div className="text-center mt-3">

                                <span className="text-muted">
                                    ¿Ya tienes una cuenta?{' '}
                                </span>

                                <Link to="/login">
                                    Iniciar sesión
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}