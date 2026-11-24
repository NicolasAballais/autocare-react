import { Link, useOutletContext } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { useCarritoConectado } from '../context/CarritoConectadoContext.jsx';
import { RUTA_CATALOGO_CONECTADO, RUTA_CHECKOUT_CONECTADO } from '../context/catalogo.js';
import ImportarCarritoLocal from '../components/ImportarCarritoLocal.jsx';
import { useSesionConectada } from '../context/sesionConectada.js';


export default function Carrito({ conectado = false }) {

    const local = useCarrito();
    const remoto = useCarritoConectado();
    const revision = useOutletContext();
    const {
        cantidadTotal,
        cambiarCantidad,
        eliminarProducto
    } = conectado ? remoto : local;
    const carrito = conectado ? revision.lineas : local.carrito;
    const total = conectado ? revision.total : local.total;
    const bloqueado = conectado && Boolean(remoto.intento);
    const { usuario: comprador, demostracion } = useSesionConectada();

    if (conectado && comprador?.rol === 'VENDEDOR') {
        return <main className="container my-5"><p>El rol VENDEDOR permite consultar productos y órdenes.</p>
            <Link to={RUTA_CATALOGO_CONECTADO}>Ver productos</Link>
        </main>;
    }


    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });


    const ahorroTotal = carrito.reduce(
        (acumulado, item) => {

            if (
                !item.descuento ||
                !item.precioOriginal
            ) {
                return acumulado;
            }

            const ahorroUnitario =
                item.precioOriginal -
                item.precio;

            return acumulado +
                ahorroUnitario *
                item.cantidad;
        },
        0
    );


    return (
        <main className="container my-5">

            <h1 className="mb-4">
                {conectado ? 'Carrito conectado' : 'Carrito de Compras'}
            </h1>


            <p>
                Productos diferentes: {carrito.length}
            </p>

            <p>
                Cantidad total: {cantidadTotal}
            </p>


            {carrito.length === 0 ? (

                <div className="alert alert-info mt-4">

                    <h5 className="mb-2">
                        Tu carrito está vacío
                    </h5>

                    <p className="mb-3">
                        Agrega productos antes de continuar con la compra.
                    </p>

                    <Link
                        to={conectado ? RUTA_CATALOGO_CONECTADO : '/productos'}
                        className="btn btn-danger"
                    >
                        Ver productos
                    </Link>

                </div>

            ) : (

                <>
                    <div className="row g-3 mt-3">

                        {carrito.map((item) => {

                            const tieneOferta =
                                item.descuento > 0
                                &&
                                item.precioOriginal
                                &&
                                item.precioOriginal >
                                item.precio;


                            return (

                                <div
                                    className="col-12"
                                    key={item.id}
                                >

                                    <div className="card shadow-sm">

                                        <div className="row g-0 align-items-center">

                                            <div className="col-md-2">

                                                <img
                                                    src={item.imagen}
                                                    className="img-fluid rounded-start"
                                                    alt={item.nombre}
                                                    style={{
                                                        maxHeight: '180px',
                                                        objectFit: 'contain'
                                                    }}
                                                />

                                            </div>


                                            <div className="col-md-10">

                                                <div className="card-body">

                                                    <div className="d-flex align-items-center gap-2 mb-2">

                                                        <h5 className="card-title mb-0">
                                                            {item.nombre}
                                                        </h5>


                                                        {tieneOferta && (

                                                            <span className="badge text-bg-danger">
                                                                -{item.descuento}%
                                                            </span>

                                                        )}

                                                    </div>


                                                    {tieneOferta ? (

                                                        <div className="mb-2">

                                                            <div>

                                                                <span className="text-muted">
                                                                    Precio original:{' '}
                                                                </span>

                                                                <span className="text-muted text-decoration-line-through">
                                                                    {
                                                                        formatoPrecio.format(
                                                                            item.precioOriginal
                                                                        )
                                                                    }
                                                                </span>

                                                            </div>


                                                            <div>

                                                                <span>
                                                                    Precio oferta:{' '}
                                                                </span>

                                                                <strong className="text-danger">
                                                                    {
                                                                        formatoPrecio.format(
                                                                            item.precio
                                                                        )
                                                                    }
                                                                </strong>

                                                            </div>


                                                            <small className="text-success">
                                                                Ahorras{' '}
                                                                {
                                                                    formatoPrecio.format(
                                                                        item.precioOriginal -
                                                                        item.precio
                                                                    )
                                                                }{' '}
                                                                por unidad
                                                            </small>

                                                        </div>

                                                    ) : (

                                                        <p className="mb-2">

                                                            Precio:{' '}

                                                            <strong>
                                                                {
                                                                    formatoPrecio.format(
                                                                        item.precio
                                                                    )
                                                                }
                                                            </strong>

                                                        </p>

                                                    )}


                                                    <div className="d-flex align-items-center gap-2 mb-2">

                                                        <label
                                                            htmlFor={`cantidad-${item.id}`}
                                                            className="mb-0"
                                                        >
                                                            Cantidad:
                                                        </label>


                                                        <input
                                                            id={`cantidad-${item.id}`}
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            style={{
                                                                width: '80px'
                                                            }}
                                                            min="1"
                                                            max={item.stock}
                                                            step="1"
                                                            value={item.cantidad}
                                                            disabled={bloqueado || (conectado && item.stock < 1)}
                                                            onChange={(event) =>
                                                                cambiarCantidad(
                                                                    item.id,
                                                                    Number(
                                                                        event.target.value
                                                                    ),
                                                                    item.stock
                                                                )
                                                            }
                                                        />


                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            disabled={bloqueado}
                                                            onClick={() =>
                                                                eliminarProducto(
                                                                    item.id
                                                                )
                                                            }
                                                        >
                                                            Eliminar
                                                        </button>

                                                    </div>


                                                    <p className="fw-bold text-danger mb-0">

                                                        Subtotal:{' '}

                                                        {
                                                            formatoPrecio.format(
                                                                item.precio *
                                                                item.cantidad
                                                            )
                                                        }

                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            );

                        })}

                    </div>


                    <div className="text-end mt-4">

                        {ahorroTotal > 0 && (

                            <p className="text-success mb-1">

                                <strong>
                                    Ahorro total:{' '}
                                    {
                                        formatoPrecio.format(
                                            ahorroTotal
                                        )
                                    }
                                </strong>

                            </p>

                        )}


                        <h3>
                            {conectado ? 'Total estimado: ' : 'Total: '}
                            {formatoPrecio.format(total)}
                        </h3>


                        {conectado && !revision.puedeContinuar ? (
                            <button type="button" className="btn btn-danger mt-3" disabled>Continuar al checkout</button>
                        ) : (
                            <Link to={conectado ? RUTA_CHECKOUT_CONECTADO : '/checkout'} className="btn btn-danger mt-3">
                                Continuar al checkout
                            </Link>
                        )}

                    </div>
                </>

            )}

            {conectado && !demostracion && !bloqueado && (
                <ImportarCarritoLocal key={comprador?.id ?? 'sin-sesion'} carritoLocal={local.carrito}
                    productos={revision.productos} aplicar={remoto.aplicarPropuesta} />
            )}
            {conectado && !bloqueado && comprador && (
                <ImportarCarritoLocal key={`anonimo-${comprador.id}`} carritoLocal={remoto.carritoSinSesion}
                    productos={revision.productos} aplicar={remoto.aplicarPropuesta} origen="carrito sin sesión" />
            )}

        </main>
    );
}
