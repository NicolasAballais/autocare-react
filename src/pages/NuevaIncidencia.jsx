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

import { useSesionConectada } from '../context/sesionConectada.js';
import { RUTA_INCIDENCIAS_CONECTADAS } from '../context/catalogo.js';
import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import EstadoEscrituraConectada from '../components/EstadoEscrituraConectada.jsx';
import { useConsultaConectada, useEscrituraConectada } from '../hooks/useOperacionesConectadas.js';
import { crearIncidenciaApi } from '../services/operacionesApi.js';
import { listarOrdenesApi } from '../services/ordenesApi.js';

export default function NuevaIncidencia({ conectado = false }) {

    const navigate = useNavigate();

    const { usuario } = useSesionConectada();
    const consulta = useConsultaConectada(conectado, listarOrdenesApi);
    const escritura = useEscrituraConectada();
    const sesion = conectado ? usuario : obtenerSesion();
    const rutaIncidencias = conectado ? RUTA_INCIDENCIAS_CONECTADAS : '/incidencias';
    const ordenes = conectado ? consulta.datos ?? [] : sesion ? obtenerOrdenesUsuario(sesion) : [];

    const [ordenId, setOrdenId] = useState('');
    const [asunto, setAsunto] = useState('');
    const [descripcion, setDescripcion] = useState('');

    async function manejarEnvio(evento) {

        evento.preventDefault();

        if (conectado) {
            if (await escritura.ejecutar(crearIncidenciaApi, { ordenId, asunto, descripcion })) navigate(rutaIncidencias);
            return;
        }

        guardarIncidencia({
            ordenId: Number(ordenId),
            asunto,
            descripcion
        });

        navigate(rutaIncidencias);
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

            {conectado && <><EstadoCatalogoAdmin consulta={consulta} /><EstadoEscrituraConectada escritura={escritura} /></>}
            {(!conectado || consulta.datos) && <div className="card shadow-sm">

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
                                    maxLength={conectado ? 150 : undefined}
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
                                    maxLength={conectado ? 2000 : undefined}
                                    onChange={(e) =>
                                        setDescripcion(e.target.value)
                                    }
                                    placeholder="Describe el problema con el mayor detalle posible."
                                    required
                                ></textarea>

                            </div>

                            <button
                                type="submit"
                                disabled={conectado && (!escritura.habilitada || escritura.procesando)}
                                className="btn btn-danger"
                            >
                                Enviar incidencia
                            </button>

                        </form>

                    )}

                </div>

            </div>}
        </main>
    );
}