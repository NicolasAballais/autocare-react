import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RUTA_ORDENES_CONECTADAS } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import { listarOrdenesApi, obtenerOrdenApi } from '../services/ordenesApi.js';

const pesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

export default function OrdenesConectadas() {
    const { id } = useParams();
    const { usuario, solicitar } = useSesionConectada();
    const [consulta, setConsulta] = useState(null);
    const usuarioId = usuario?.id;

    useEffect(() => {
        let vigente = true;
        if (!usuarioId) return undefined;
        const operacion = id ? (token) => obtenerOrdenApi(id, token) : listarOrdenesApi;
        solicitar(operacion, usuarioId).then((datos) => {
            if (vigente) setConsulta({ id, usuarioId, datos });
        }).catch((error) => {
            if (!vigente) return;
            const mensaje = { 401: 'Inicia sesión de nuevo.', 403: 'No tienes permiso para consultar órdenes.',
                404: 'Orden no encontrada.' }[error.estado] ?? 'No se pudieron consultar las órdenes.';
            setConsulta({ id, usuarioId, mensaje });
        });
        return () => { vigente = false; };
    }, [id, usuarioId, solicitar]);

    const actual = consulta?.id === id && consulta?.usuarioId === usuarioId ? consulta : null;
    return (
        <main className="container my-5">
            <h1>{id ? 'Detalle de orden conectada' : usuario?.rol === 'CLIENTE' ? 'Mis órdenes conectadas' : 'Órdenes conectadas'}</h1>
            {id && <Link to={RUTA_ORDENES_CONECTADAS}>Volver a las órdenes</Link>}
            {!actual && <p role="status">Consultando órdenes…</p>}
            {actual?.mensaje && <p className="alert alert-warning" role="alert">{actual.mensaje}</p>}
            {id && actual?.datos && (
                <section className="card p-3 mt-3">
                    <h2 className="h5">Orden {actual.datos.id}</h2>
                    <p>{actual.datos.estado} · {pesos.format(actual.datos.total)}</p>
                    <ul>{actual.datos.productos.map((linea) => (
                        <li key={linea.productoId}>{linea.nombre} × {linea.cantidad} · {pesos.format(linea.subtotal)}</li>
                    ))}</ul>
                </section>
            )}
            {!id && Array.isArray(actual?.datos) && (actual.datos.length ? (
                <ul className="list-group mt-3">{actual.datos.map((orden) => (
                    <li className="list-group-item" key={orden.id}>
                        <Link to={`${RUTA_ORDENES_CONECTADAS}/${orden.id}`}>Orden {orden.id}</Link>{' '}
                        · {orden.estado} · {pesos.format(orden.total)}
                    </li>
                ))}</ul>
            ) : <p>Todavía no hay órdenes.</p>)}
        </main>
    );
}
