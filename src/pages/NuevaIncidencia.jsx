import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerOrdenes } from '../data/ordenes';
import { guardarIncidencia } from '../data/incidencias';

export default function NuevaIncidencia() {

    const navigate = useNavigate();

    const ordenes = obtenerOrdenes();

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

        navigate('/ordenes');
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

                    <form onSubmit={manejarEnvio}>

                        <div className="mb-3">

                            <label className="form-label">
                                Orden relacionada
                            </label>

                            <select
                                className="form-select"
                                value={ordenId}
                                onChange={(e) => setOrdenId(e.target.value)}
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
                                onChange={(e) => setAsunto(e.target.value)}
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
                                onChange={(e) => setDescripcion(e.target.value)}
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

                </div>

            </div>

        </main>
    );
}