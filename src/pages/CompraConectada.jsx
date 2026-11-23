import { Link, useLocation, useOutletContext } from 'react-router-dom';
import { useCarritoConectado } from '../context/CarritoConectadoContext.jsx';
import { RUTA_CHECKOUT_CONECTADO } from '../context/catalogo.js';
import { enviarOrdenApi, obtenerOrdenApi, prepararSolicitudOrden } from '../services/ordenesApi.js';
import { ENVIO_ORDENES_HABILITADO } from '../services/ordenesConfiguracion.js';

const formatoPrecio = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

export default function CompraConectada({ envioHabilitado = ENVIO_ORDENES_HABILITADO,
    enviar = enviarOrdenApi, consultar = obtenerOrdenApi }) {
    const { datosCliente, tipoEntrega } = useLocation().state ?? {};
    const { ordenConfirmada, intento, mensaje, procesando, registrarCompra, consultarPendiente } = useCarritoConectado();
    const { lineas, total, puedeContinuar } = useOutletContext();

    if (ordenConfirmada) {
        return (
            <main className="container my-5">
                <h1>Orden confirmada</h1>
                <p>ID de la orden: <strong>{ordenConfirmada.id}</strong></p>
                <p>Total confirmado por Spring Boot: <strong>{formatoPrecio.format(ordenConfirmada.total)}</strong></p>
            </main>
        );
    }

    if (intento) {
        return (
            <main className="container my-5">
                <h1>Compra pendiente de verificación</h1>
                <p role="status">{procesando ? 'Comprobando el resultado…' : mensaje || 'El carrito sigue guardado.'}</p>
                {intento.id ? (
                    <>
                        <p>ID de la orden: {intento.id}</p>
                        <button type="button" className="btn btn-outline-secondary" disabled={procesando}
                            onClick={() => consultarPendiente(consultar)}>Consultar orden</button>
                    </>
                ) : <p>Verifica el estado con administración antes de intentar otra compra.</p>}
            </main>
        );
    }

    if (!datosCliente || !tipoEntrega || !lineas.length) {
        return (
            <main className="container my-5">
                <h1>Revisar compra conectada</h1>
                <p>Completa el checkout con productos y datos de entrega para preparar una orden.</p>
                <Link to={RUTA_CHECKOUT_CONECTADO}>Ir al checkout conectado</Link>
            </main>
        );
    }

    const solicitud = prepararSolicitudOrden(lineas);
    return (
        <main className="container my-5">
            <h1>Revisar compra conectada</h1>
            <p>Entrega seleccionada: {tipoEntrega}</p>
            <p>Los datos de entrega se usan en esta sesión y quedan fuera del contrato de órdenes.</p>
            <p>Total estimado: <strong>{formatoPrecio.format(total)}</strong>. Spring Boot calcula el total definitivo.</p>
            {!envioHabilitado && <div className="alert alert-warning">Envío de órdenes deshabilitado durante la revisión.</div>}
            {mensaje && <div className="alert alert-danger" role="alert">{mensaje}</div>}
            <details className="mb-3">
                <summary>Ver solicitud de la orden</summary>
                <pre>{JSON.stringify(solicitud, null, 2)}</pre>
            </details>
            <button type="button" className="btn btn-danger" disabled={!envioHabilitado || !puedeContinuar || procesando}
                onClick={() => registrarCompra(solicitud, enviar, consultar)}>Confirmar compra</button>
            <Link className="btn btn-outline-secondary ms-2" to={RUTA_CHECKOUT_CONECTADO}
                state={{ datosCliente, tipoEntrega }}>Volver al checkout</Link>
        </main>
    );
}
