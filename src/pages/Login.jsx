import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../services/usuariosService';
import { useSesionConectada } from '../context/sesionConectada.js';
import { RUTA_ADMIN_CONECTADA, RUTA_CATALOGO_CONECTADO, RUTA_ORDENES_CONECTADAS,
    RUTA_REGISTRO_CONECTADO } from '../context/catalogo.js';

export default function Login({ conectado = false }) {

    const navigate = useNavigate();
    const { state } = useLocation();
    const sesion = useSesionConectada();

    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [procesando, setProcesando] = useState(false);

    async function manejarLogin(evento) {

        evento.preventDefault();

        setMensaje('');

        if (procesando) return;
        if (conectado) {
            if (!sesion.habilitado) return;
            setProcesando(true);
            try {
                const usuario = await sesion.iniciarSesion({ correo: correo.trim(), contrasena: password });
                if (!usuario) return;
                const volver = state?.volver;
                const destino = usuario.rol === 'VENDEDOR' ? RUTA_ORDENES_CONECTADAS :
                    typeof volver === 'string' && volver.startsWith(`${RUTA_CATALOGO_CONECTADO}/`) ? volver :
                        usuario.rol === 'ADMIN' ? RUTA_ADMIN_CONECTADA : RUTA_CATALOGO_CONECTADO;
                navigate(destino, { replace: true });
            } catch (error) {
                setMensaje(error.estado === 401 ? 'Correo o contraseña incorrectos.' :
                    'No se pudo iniciar sesión conectada. Revisa tus datos o vuelve a intentar.');
            } finally {
                setPassword('');
                setProcesando(false);
            }
            return;
        }

        const resultado = await iniciarSesion(
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
                                    {conectado ? 'Iniciar sesión conectada' : 'Iniciar Sesión'}
                                </h2>

                            </div>

                            {mensaje && (

                                <div className="alert alert-danger" role="alert">
                                    {mensaje}
                                </div>

                            )}

                            {conectado && !sesion.habilitado && <p className="alert alert-info">La prueba de autenticación conectada está deshabilitada.</p>}
                            {conectado && state?.cuentaCreada && <p className="alert alert-success" role="status">Cuenta creada. Ingresa con tus datos.</p>}

                            <form onSubmit={manejarLogin}>

                                <div className="mb-3">

                                    <label className="form-label" htmlFor="correo-login">
                                        Correo Electrónico
                                    </label>

                                    <input
                                        type="email"
                                        id="correo-login"
                                        autoComplete="username"
                                        className="form-control"
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        placeholder="ejemplo@duoc.cl"
                                        required
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label" htmlFor="clave-login">
                                        Contraseña
                                    </label>

                                    <input
                                        type="password"
                                        id="clave-login"
                                        autoComplete="current-password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-danger w-100"
                                    disabled={procesando || (conectado && !sesion.habilitado)}
                                >
                                    Ingresar
                                </button>

                            </form>

                            <div className="text-center mt-3">

                                <span>
                                    ¿No tienes cuenta?{' '}
                                </span>

                                <Link
                                    to={conectado ? RUTA_REGISTRO_CONECTADO : '/register'}
                                    state={conectado ? state : undefined}
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
