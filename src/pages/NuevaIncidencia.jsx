import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
    obtenerOrdenesUsuario
} from '../services/ordenesService';

import {
    guardarIncidencia
} from '../services/incidenciasService';

import {
    obtenerSesion
} from '../services/usuariosService';

export default function NuevaIncidencia() {

    const navigate = useNavigate();

    const sesion = obtenerSesion();

    const ordenes = sesion
        ? obtenerOrdenesUsuario(sesion)
        : [];

    const [ordenId, setOrdenId] = useState('');
    const [asunto, setAsunto] = useState('');
    const [descripcion, setDescripcion] = useState('');

    function manejarEnvio(evento) {

        evento.preventDefault();

        guardarIncidencia({
            ordenId: Number(ordenId),
            asunto,
            descripcion
        });

        navigate('/incidencias');
    }

    if (!sesion) {

        return (
            <main className="container my-5">

                <div className="alert alert-warning">
                    Debes iniciar sesión para reportar una incidencia.
                </div>

                <Link
                    to="/login"
                    className="btn btn-danger"
                >
                    Iniciar sesión
                </Link>

            </main>
        );
    }

    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Reportar incidencia
                </h1>

                <p className="text-muted">
                    Informa un problema relacionado con una de tus compras.
                </p>

            </div>

            <div className="card shadow-sm">

                <div className="card-body">

                    {ordenes.length === 0 ? (

                        <div className="alert alert-info mb-0">

                            No tienes órdenes disponibles para reportar una incidencia.

                        </div>

                    ) : (

                        <form onSubmit={manejarEnvio}>

                            <div className="mb-3">

                                <label className="form-label">
                                    Orden relacionada
                                </label>

                                <select
                                    className="form-select"
                                    value={ordenId}
                                    onChange={(e) =>
                                        setOrdenId(e.target.value)
                                    }
                                    required
                                >

                                    <option value="">
                                        Selecciona una orden
                                    </option>

                                    {ordenes.map((orden) => (

                                        <option
                                            key={orden.id}
                                            value={orden.id}
                                        >
                                            #{orden.id} - ${orden.total.toLocaleString('es-CL')}
                                        </option>

                                    ))}

                                </select>

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Asunto
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={asunto}
                                    onChange={(e) =>
                                        setAsunto(e.target.value)
                                    }
                                    placeholder="Ej: Producto recibido con problemas"
                                    required
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Descripción
                                </label>

                                <textarea
                                    className="form-control"
                                    rows="5"
                                    value={descripcion}
                                    onChange={(e) =>
                                        setDescripcion(e.target.value)
                                    }
                                    placeholder="Describe el problema con el mayor detalle posible."
                                    required
                                ></textarea>

                            </div>

                            <button
                                type="submit"
                                className="btn btn-danger"
                            >
                                Enviar incidencia
                            </button>

                        </form>

                    )}

                </div>

            </div>

        </main>
    );
}