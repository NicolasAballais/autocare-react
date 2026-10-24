import { useState } from 'react';


export default function Contacto() {

    const [formulario, setFormulario] = useState({
        nombre: '',
        correo: '',
        comentario: ''
    });

    const [errores, setErrores] = useState({});

    const [mensajeExito, setMensajeExito] = useState('');


    function manejarCambio(evento) {

        const { name, value } = evento.target;

        setFormulario({
            ...formulario,
            [name]: value
        });

        setErrores({
            ...errores,
            [name]: ''
        });

        setMensajeExito('');
    }


    function validarFormulario() {

        const nuevosErrores = {};

        const nombre =
            formulario.nombre.trim();

        const correo =
            formulario.correo.trim();

        const comentario =
            formulario.comentario.trim();


        if (!nombre) {

            nuevosErrores.nombre =
                'El nombre es obligatorio.';

        } else if (nombre.length > 100) {

            nuevosErrores.nombre =
                'El nombre no puede superar los 100 caracteres.';
        }


        if (correo) {

            if (correo.length > 100) {

                nuevosErrores.correo =
                    'El correo no puede superar los 100 caracteres.';

            } else {

                const correoValido =
                    /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

                if (!correoValido.test(correo)) {

                    nuevosErrores.correo =
                        'Utiliza un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.';
                }
            }
        }


        if (!comentario) {

            nuevosErrores.comentario =
                'El mensaje es obligatorio.';

        } else if (comentario.length > 500) {

            nuevosErrores.comentario =
                'El mensaje no puede superar los 500 caracteres.';
        }


        setErrores(nuevosErrores);

        return Object.keys(
            nuevosErrores
        ).length === 0;
    }


    function manejarEnvio(evento) {

        evento.preventDefault();

        setMensajeExito('');


        if (!validarFormulario()) {
            return;
        }


        const mensajesGuardados =
            JSON.parse(
                localStorage.getItem(
                    'mensajesContactoAutoCare'
                )
            ) || [];


        const nuevoMensaje = {
            id: Date.now(),
            nombre: formulario.nombre.trim(),
            correo: formulario.correo.trim(),
            comentario: formulario.comentario.trim(),
            fecha: new Date().toLocaleString('es-CL')
        };


        localStorage.setItem(
            'mensajesContactoAutoCare',
            JSON.stringify([
                ...mensajesGuardados,
                nuevoMensaje
            ])
        );


        setFormulario({
            nombre: '',
            correo: '',
            comentario: ''
        });


        setErrores({});


        setMensajeExito(
            'Tu mensaje fue enviado correctamente.'
        );
    }


    return (
        <main className="container my-5">

            <div className="row justify-content-center">

                <div className="col-lg-8">

                    <div className="card shadow-sm">

                        <div className="card-body p-4 p-md-5">

                            <h1 className="text-center mb-2">
                                Contacto
                            </h1>

                            <p className="text-muted text-center mb-4">
                                Envíanos tus consultas, comentarios o sugerencias.
                            </p>


                            {mensajeExito && (

                                <div
                                    className="alert alert-success"
                                    role="alert"
                                >
                                    <i className="bi bi-check-circle me-2"></i>

                                    {mensajeExito}
                                </div>

                            )}


                            <form
                                onSubmit={manejarEnvio}
                                noValidate
                            >

                                <div className="mb-3">

                                    <label
                                        htmlFor="nombreContacto"
                                        className="form-label"
                                    >
                                        Nombre completo
                                    </label>

                                    <input
                                        type="text"
                                        id="nombreContacto"
                                        name="nombre"
                                        className={
                                            errores.nombre
                                                ? 'form-control is-invalid'
                                                : 'form-control'
                                        }
                                        placeholder="Tu nombre"
                                        value={formulario.nombre}
                                        onChange={manejarCambio}
                                        maxLength="100"
                                    />

                                    {errores.nombre && (

                                        <div className="invalid-feedback">
                                            {errores.nombre}
                                        </div>

                                    )}

                                </div>


                                <div className="mb-3">

                                    <label
                                        htmlFor="emailContacto"
                                        className="form-label"
                                    >
                                        Correo electrónico
                                    </label>

                                    <input
                                        type="email"
                                        id="emailContacto"
                                        name="correo"
                                        className={
                                            errores.correo
                                                ? 'form-control is-invalid'
                                                : 'form-control'
                                        }
                                        placeholder="ejemplo@duoc.cl"
                                        value={formulario.correo}
                                        onChange={manejarCambio}
                                        maxLength="100"
                                    />

                                    <div className="form-text">
                                        Dominios permitidos: @duoc.cl, @profesor.duoc.cl y @gmail.com
                                    </div>

                                    {errores.correo && (

                                        <div className="invalid-feedback">
                                            {errores.correo}
                                        </div>

                                    )}

                                </div>


                                <div className="mb-4">

                                    <label
                                        htmlFor="comentarioContacto"
                                        className="form-label"
                                    >
                                        Mensaje o comentario
                                    </label>

                                    <textarea
                                        id="comentarioContacto"
                                        name="comentario"
                                        className={
                                            errores.comentario
                                                ? 'form-control is-invalid'
                                                : 'form-control'
                                        }
                                        rows="5"
                                        placeholder="Escribe tu mensaje aquí..."
                                        value={formulario.comentario}
                                        onChange={manejarCambio}
                                        maxLength="500"
                                    ></textarea>


                                    <div className="d-flex justify-content-between">

                                        <div>

                                            {errores.comentario && (

                                                <div className="text-danger small mt-1">
                                                    {errores.comentario}
                                                </div>

                                            )}

                                        </div>

                                        <small className="text-muted mt-1">
                                            {formulario.comentario.length}/500
                                        </small>

                                    </div>

                                </div>


                                <button
                                    type="submit"
                                    className="btn btn-danger w-100 btn-lg"
                                >
                                    Enviar mensaje
                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}