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


        if (correoLimpio.length > 100) {

            setMensaje(
                'El correo no puede superar los 100 caracteres.'
            );

            return;
        }


        if (
            password.length < 4 ||
            password.length > 10
        ) {

            setMensaje(
                'La contraseña debe tener entre 4 y 10 caracteres.'
            );

            return;
        }


        if (password !== confirmarPassword) {

            setMensaje(
                'Las contraseñas no coinciden.'
            );

            return;
        }


        const resultado = registrarUsuario({
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
                                        maxLength="100"
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
                                        minLength="4"
                                        maxLength="10"
                                        required
                                    />

                                    <div className="form-text">
                                        Debe contener entre 4 y 10 caracteres.
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
                                        minLength="4"
                                        maxLength="10"
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