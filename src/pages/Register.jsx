import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../services/usuariosService';
import { useSesionConectada } from '../context/sesionConectada.js';
import { RUTA_LOGIN_CONECTADO } from '../context/catalogo.js';


export default function Register({ conectado = false }) {

    const navigate = useNavigate();
    const { state } = useLocation();
    const sesion = useSesionConectada();

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [procesando, setProcesando] = useState(false);
    const minimo = conectado ? 8 : 4;
    const maximo = conectado ? 72 : 10;


    async function manejarRegistro(evento) {

        evento.preventDefault();

        setMensaje('');
        if (procesando) return;


        const nombreLimpio = nombre.trim();
        const apellidoLimpio = apellido.trim();
        const correoLimpio = correo.trim();


        if (!nombreLimpio || !apellidoLimpio || !correoLimpio) {

            setMensaje(
                'Debes completar todos los campos obligatorios.'
            );

            return;
        }


        if (nombreLimpio.length > 50) {

            setMensaje(
                'El nombre no puede superar los 50 caracteres.'
            );

            return;
        }


        if (apellidoLimpio.length > 100) {

            setMensaje(
                'El apellido no puede superar los 100 caracteres.'
            );

            return;
        }


        if (correoLimpio.length > (conectado ? 254 : 100)) {

            setMensaje(
                'El correo supera la longitud permitida.'
            );

            return;
        }


        if (
            password.length < minimo ||
            password.length > maximo || (conectado && new TextEncoder().encode(password).length > 72)
        ) {

            setMensaje(
                `La contraseña debe tener entre ${minimo} y ${maximo} caracteres${conectado ? ' y un máximo de 72 bytes' : ''}.`
            );

            return;
        }


        if (password !== confirmarPassword) {

            setMensaje(
                'Las contraseñas no coinciden.'
            );

            return;
        }


        if (conectado) {
            if (!sesion.habilitado) return;
            const nombreCompleto = `${nombreLimpio} ${apellidoLimpio}`;
            if (nombreCompleto.length > 100) {
                setMensaje('El nombre completo no puede superar los 100 caracteres.');
                return;
            }
            setProcesando(true);
            try {
                await sesion.registrar({ nombre: nombreCompleto, correo: correoLimpio, contrasena: password });
                navigate(RUTA_LOGIN_CONECTADO, { replace: true, state: { ...state, cuentaCreada: true } });
            } catch (error) {
                setMensaje(error.estado === 409 ? 'Ya existe una cuenta con ese correo.' :
                    error.estado === 400 ? 'Revisa el nombre, correo y contraseña de registro.' : 'No se pudo registrar la cuenta conectada.');
            } finally {
                setPassword('');
                setConfirmarPassword('');
                setProcesando(false);
            }
            return;
        }

        const resultado = await registrarUsuario({
            nombre: nombreLimpio,
            apellido: apellidoLimpio,
            correo: correoLimpio,
            password
        });


        if (!resultado.exito) {

            setMensaje(
                resultado.mensaje
            );

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
                                {conectado ? 'Crear cuenta conectada' : 'Crear cuenta'}
                            </h1>

                            <p className="text-muted mb-4">
                                Regístrate para gestionar tus compras en AutoCarePro.
                            </p>


                            {mensaje && (

                                <div className="alert alert-danger" role="alert">
                                    {mensaje}
                                </div>

                            )}

                            {conectado && !sesion.habilitado && <p className="alert alert-info">La prueba de autenticación conectada está deshabilitada.</p>}


                            <form onSubmit={manejarRegistro}>

                                <div className="row">

                                    <div className="col-md-6 mb-3">

                                        <label
                                            htmlFor="nombreRegistro"
                                            className="form-label"
                                        >
                                            Nombre
                                        </label>

                                        <input
                                            id="nombreRegistro"
                                            type="text"
                                            className="form-control"
                                            value={nombre}
                                            onChange={(e) =>
                                                setNombre(e.target.value)
                                            }
                                            maxLength="50"
                                            required
                                        />

                                    </div>


                                    <div className="col-md-6 mb-3">

                                        <label
                                            htmlFor="apellidoRegistro"
                                            className="form-label"
                                        >
                                            Apellido
                                        </label>

                                        <input
                                            id="apellidoRegistro"
                                            type="text"
                                            className="form-control"
                                            value={apellido}
                                            onChange={(e) =>
                                                setApellido(e.target.value)
                                            }
                                            maxLength="100"
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="mb-3">

                                    <label
                                        htmlFor="correoRegistro"
                                        className="form-label"
                                    >
                                        Correo electrónico
                                    </label>

                                    <input
                                        id="correoRegistro"
                                        type="email"
                                        className="form-control"
                                        value={correo}
                                        onChange={(e) =>
                                            setCorreo(e.target.value)
                                        }
                                        maxLength={conectado ? 254 : 100}
                                        required
                                    />

                                </div>


                                <div className="mb-3">

                                    <label
                                        htmlFor="passwordRegistro"
                                        className="form-label"
                                    >
                                        Contraseña
                                    </label>

                                    <input
                                        id="passwordRegistro"
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        minLength={minimo}
                                        maxLength={maximo}
                                        autoComplete="new-password"
                                        required
                                    />

                                    <div className="form-text">
                                        Debe contener entre {minimo} y {maximo} caracteres.
                                    </div>

                                </div>


                                <div className="mb-3">

                                    <label
                                        htmlFor="confirmarPasswordRegistro"
                                        className="form-label"
                                    >
                                        Confirmar contraseña
                                    </label>

                                    <input
                                        id="confirmarPasswordRegistro"
                                        type="password"
                                        className="form-control"
                                        value={confirmarPassword}
                                        onChange={(e) =>
                                            setConfirmarPassword(e.target.value)
                                        }
                                        minLength={minimo}
                                        maxLength={maximo}
                                        autoComplete="new-password"
                                        required
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="btn btn-danger w-100"
                                    disabled={procesando || (conectado && !sesion.habilitado)}
                                >
                                    Crear cuenta
                                </button>

                            </form>


                            <div className="text-center mt-3">

                                <span className="text-muted">
                                    ¿Ya tienes una cuenta?{' '}
                                </span>

                                <Link to={conectado ? RUTA_LOGIN_CONECTADO : '/login'} state={conectado ? state : undefined}>
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
