import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RUTA_ORDENES_CONECTADAS } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import { listarOrdenesApi, obtenerOrdenApi } from '../services/ordenesApi.js';

const pesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
const montosHistoricos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 16 });
const descuentos = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 16 });
const fechaCompra = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Santiago' });

function ComprobanteCompra({ orden }) {
    const fecha = orden.fechaCreacion ? new Date(orden.fechaCreacion) : null;
    return (
        <section className="card p-3 mt-3">
            <h2 className="h5">Orden {orden.id}</h2>
            <p>Fecha de compra: {Number.isFinite(fecha?.getTime())
                ? <time dateTime={orden.fechaCreacion}>{fechaCompra.format(fecha)}</time>
                : 'No disponible'}</p>
            {orden.estado && <p>Estado de la orden: {orden.estado}</p>}
            <div className="table-responsive">
                <table className="table align-middle">
                    <thead>
                        <tr>
                            <th scope="col">Producto</th>
                            <th scope="col">Cantidad</th>
                            <th scope="col">Precio original</th>
                            <th scope="col">Descuento</th>
                            <th scope="col">Precio unitario aplicado</th>
                            <th scope="col">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orden.productos.map((linea) => (
                            <tr key={linea.productoId}>
                                <th scope="row">{linea.nombre}</th>
                                <td>{linea.cantidad}</td>
                                <td>{montosHistoricos.format(linea.precioOriginal)}</td>
                                <td>{descuentos.format(linea.descuento)} %</td>
                                <td>{montosHistoricos.format(linea.precioUnitario)}</td>
                                <td>{montosHistoricos.format(linea.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-end fw-bold">Total confirmado: {montosHistoricos.format(orden.total)}</p>
            <p className="text-muted mb-0">Comprobante informativo de AutoCarePro, sin validez tributaria.</p>
        </section>
    );
}

export default function OrdenesConectadas({ comprobante = false }) {
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
    const tituloOrdenes = usuario?.rol === 'CLIENTE' ? 'Mis órdenes conectadas' : 'Órdenes conectadas';
    const rutaDetalle = `${RUTA_ORDENES_CONECTADAS}/${id}`;
    if (comprobante) {
        return (
            <main className="container my-5">
                <h1>Comprobante de compra</h1>
                <Link to={rutaDetalle}>Volver al detalle de la orden</Link>
                {!actual && <p role="status">Consultando orden…</p>}
                {actual?.mensaje && <p className="alert alert-warning" role="alert">{actual.mensaje}</p>}
                {actual?.datos && <ComprobanteCompra orden={actual.datos} />}
            </main>
        );
    }

    return (
        <main className="container my-5">
            <h1>{id ? 'Detalle de orden conectada' : tituloOrdenes}</h1>
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
                    <div><Link className="btn btn-outline-primary" to={`${rutaDetalle}/boleta`}>Ver comprobante</Link></div>
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
