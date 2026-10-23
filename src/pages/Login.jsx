import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../data/usuarios';

export default function Login() {

    const navigate = useNavigate();

    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');

    function manejarLogin(evento) {

        evento.preventDefault();

        setMensaje('');

        const resultado = iniciarSesion(
            correo,
            password
        );

        if (!resultado.exito) {
            setMensaje(resultado.mensaje);
            return;
        }

        if (resultado.usuario.rol === 'admin') {
            navigate('/admin');
        } else {
            navigate('/');
        }
    }

    return (
        <main className="container my-5">

            <div className="row justify-content-center">

                <div className="col-md-7 col-lg-6">

                    <div className="card shadow-sm">

                        <div className="card-body p-4">

                            <div className="text-center mb-4">

                                <i className="bi bi-speedometer2 fs-1 text-danger"></i>

                                <h3 className="mt-2">
                                    AutoCare<span className="text-danger">Pro</span>
                                </h3>

                                <h2>
                                    Iniciar Sesión
                                </h2>

                            </div>

                            {mensaje && (

                                <div className="alert alert-danger">
                                    {mensaje}
                                </div>

                            )}

                            <form onSubmit={manejarLogin}>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Correo Electrónico
                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        placeholder="ejemplo@duoc.cl"
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

                                <button
                                    type="submit"
                                    className="btn btn-danger w-100"
                                >
                                    Ingresar
                                </button>

                            </form>

                            <div className="text-center mt-3">

                                <span>
                                    ¿No tienes cuenta?{' '}
                                </span>

                                <Link
                                    to="/register"
                                    className="text-danger fw-bold"
                                >
                                    Regístrate aquí
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}