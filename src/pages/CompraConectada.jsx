import { Link, useLocation, useOutletContext } from 'react-router-dom';
import { useCarritoConectado } from '../context/CarritoConectadoContext.jsx';
import { RUTA_CHECKOUT_CONECTADO } from '../context/catalogo.js';
import { crearEnvioOrden, obtenerOrdenApi, prepararSolicitudOrden, solicitudDelIntento,
    sonProductosTemporales } from '../services/ordenesApi.js';
import { modoPruebaOrdenesActivo } from '../services/ordenesConfiguracion.js';
import { useSesionConectada } from '../context/sesionConectada.js';

const formatoPrecio = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

function MensajeCompra({ mensaje }) {
    if (!mensaje) return null;
    const campos = Object.entries(mensaje.campos ?? {});
    return (
        <div className="alert alert-warning" role="alert">
            {mensaje.texto}
            {campos.length > 0 && <ul className="mb-0">{campos.map(([campo, detalle]) => (
                <li key={campo}>{campo} · {detalle}</li>
            ))}</ul>}
        </div>
    );
}

export default function CompraConectada({ envioHabilitado, enviar, consultar = obtenerOrdenApi }) {
    const { state } = useLocation();
    const { usuario, demostracion, escriturasHabilitadas } = useSesionConectada();
    const habilitado = demostracion ? escriturasHabilitadas === true : envioHabilitado ?? modoPruebaOrdenesActivo();
    const enviarCompra = enviar ?? crearEnvioOrden({ habilitado, soloTemporales: !demostracion });
    const { datosCliente, tipoEntrega } = (state?.compradorId === usuario?.id ? state : null) ?? {};
    const { ordenConfirmada, intento, mensaje, procesando, registrarCompra, consultarPendiente,
        reintentarCompra } = useCarritoConectado();
    const { lineas, total, puedeContinuar, productos } = useOutletContext();
    const rolPuedeComprar = ['ADMIN', 'CLIENTE'].includes(usuario?.rol);

    if (ordenConfirmada) {
        return (
            <main className="container my-5">
                <h1>Orden confirmada</h1>
                <p>ID de la orden: <strong>{ordenConfirmada.id}</strong></p>
                <p>Total confirmado por Spring Boot: <strong>{formatoPrecio.format(ordenConfirmada.total)}</strong></p>
                {ordenConfirmada.productos && (
                    <ul aria-label="Productos confirmados">{ordenConfirmada.productos.map((producto) => (
                        <li key={producto.productoId}>{producto.nombre} × {producto.cantidad}</li>
                    ))}</ul>
                )}
            </main>
        );
    }

    if (intento) {
        const solicitudGuardada = solicitudDelIntento(intento);
        const productosPermitidos = demostracion || sonProductosTemporales(solicitudGuardada, productos);
        return (
            <main className="container my-5">
                <h1>Compra pendiente de verificación</h1>
                <p role="status">{procesando ? 'Comprobando el resultado…' : 'El carrito sigue guardado.'}</p>
                <MensajeCompra mensaje={mensaje} />
                {solicitudGuardada ? (
                    <>
                        <p>ID de la orden: {intento.id}</p>
                        <button type="button" className="btn btn-outline-secondary" disabled={procesando}
                            onClick={() => consultarPendiente(consultar)}>Consultar orden</button>
                        <button type="button" className="btn btn-danger ms-2"
                            disabled={procesando || !rolPuedeComprar || !habilitado || !productosPermitidos}
                            onClick={() => reintentarCompra(enviarCompra, consultar)}>Reintentar la misma compra</button>
                        {!habilitado && <p className="text-muted mt-2">Envío de órdenes deshabilitado durante la revisión.</p>}
                        {habilitado && !productosPermitidos && <p className="text-muted mt-2">
                            El reintento requiere verificar todos los productos temporales con código TEST-.
                        </p>}
                    </>
                ) : <p>Este intento anterior no tiene una solicitud verificable. Consulta su estado con administración.</p>}
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
    const productosPermitidos = demostracion || sonProductosTemporales(solicitud, productos);
    return (
        <main className="container my-5">
            <h1>Revisar compra conectada</h1>
            <p>Entrega seleccionada: {tipoEntrega}</p>
            <p>Los datos de entrega se usan en esta sesión y quedan fuera del contrato de órdenes.</p>
            <p>Total estimado: <strong>{formatoPrecio.format(total)}</strong>. Spring Boot calcula el total definitivo.</p>
            {!habilitado && <div className="alert alert-warning">Envío de órdenes deshabilitado durante la revisión.</div>}
            {habilitado && !productosPermitidos && <p>La prueba admite únicamente productos temporales con código TEST-.</p>}
            <MensajeCompra mensaje={mensaje} />
            <details className="mb-3">
                <summary>Ver solicitud de la orden</summary>
                <pre>{JSON.stringify(solicitud, null, 2)}</pre>
            </details>
            <button type="button" className="btn btn-danger"
                disabled={!rolPuedeComprar || !habilitado || !productosPermitidos || !puedeContinuar || procesando}
                onClick={() => registrarCompra(solicitud, enviarCompra, consultar)}>Confirmar compra</button>
            <Link className="btn btn-outline-secondary ms-2" to={RUTA_CHECKOUT_CONECTADO}
                state={{ datosCliente, tipoEntrega, compradorId: usuario.id }}>Volver al checkout</Link>
        </main>
    );
}
