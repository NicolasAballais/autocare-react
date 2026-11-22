import { Link, useParams } from 'react-router-dom';

import {
    obtenerProductos,
    obtenerDescuentoProducto,
    obtenerPrecioFinalProducto,
    productoEstaEnOferta
} from '../services/productosService';

import {
    useCarrito
} from '../context/CarritoContext';
import { RUTA_CATALOGO_CONECTADO, useCatalogoConectado } from '../context/catalogo';


export default function DetalleProducto() {

    const { id } = useParams();
    const catalogo = useCatalogoConectado();
    const conectado = Boolean(catalogo);
    const rutaProductos = conectado ? RUTA_CATALOGO_CONECTADO : '/productos';

    const {
        agregarProducto
    } = useCarrito();


    const productos = conectado ? catalogo.productos : obtenerProductos();
    const idProducto = conectado ? id : Number(id);
    const producto = productos.find((producto) => producto.id === idProducto);


    if (!producto) {

        return (
            <main className="container my-5 text-center">

                <h1>
                    Producto no encontrado
                </h1>

                <Link
                    to={rutaProductos}
                    className="btn btn-danger mt-3"
                >
                    Volver al catálogo
                </Link>

            </main>
        );
    }


    const descuento =
        obtenerDescuentoProducto(
            producto
        );

    const precioFinal = conectado ? producto.precioFinal : obtenerPrecioFinalProducto(producto);

    const enOferta =
        productoEstaEnOferta(
            producto
        );


    const formatoPrecio =
        new Intl.NumberFormat(
            'es-CL',
            {
                style: 'currency',
                currency: 'CLP',
                maximumFractionDigits: 0
            }
        );


    function agregarConPrecioFinal() {

        agregarProducto({
            ...producto,

            precioOriginal:
                producto.precio,

            precio:
                precioFinal,

            descuento
        });
    }


    return (
        <main className="container my-5">

            <div className="row g-5 align-items-center">

                <div className="col-md-6">

                    <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="img-fluid rounded shadow-sm"
                    />

                </div>


                <div className="col-md-6">

                    <div className="mb-3">

                        <span className="badge text-bg-secondary">
                            {producto.categoria}
                        </span>


                        {enOferta && (

                            <span className="badge text-bg-danger ms-2">
                                -{descuento}%
                            </span>

                        )}

                    </div>


                    <h1>
                        {producto.nombre}
                    </h1>


                    <p className="lead text-muted">
                        {producto.descripcion}
                    </p>


                    {enOferta ? (

                        <div className="mb-3">

                            <div
                                className="
                                    text-muted
                                    text-decoration-line-through
                                    fs-5
                                "
                            >
                                {formatoPrecio.format(
                                    producto.precio
                                )}
                            </div>

                            <h3 className="text-danger mb-0">
                                {formatoPrecio.format(
                                    precioFinal
                                )}
                            </h3>

                            <small className="text-success">
                                Ahorras{' '}
                                {
                                    formatoPrecio.format(
                                        producto.precio -
                                        precioFinal
                                    )
                                }
                            </small>

                        </div>

                    ) : (

                        <h3 className="text-danger">
                            {formatoPrecio.format(
                                conectado ? precioFinal : producto.precio
                            )}
                        </h3>

                    )}


                    <p>
                        <strong>
                            Código:
                        </strong>{' '}
                        {producto.codigo}
                    </p>


                    <p>
                        <strong>
                            Stock disponible:
                        </strong>{' '}
                        {producto.stock}
                    </p>


                    {
                        producto.stock <=
                        producto.stockCritico
                        && (

                            <div className="alert alert-warning">
                                Stock crítico
                            </div>

                        )
                    }


                    <div className="d-flex gap-2 mt-4">

                        <button
                            type="button"
                            className="btn btn-danger"
                            disabled={conectado || producto.stock <= 0}
                            onClick={conectado ? undefined : agregarConPrecioFinal}
                        >
                            <i className="bi bi-cart-plus me-2"></i>

                            {conectado ? 'Solo lectura' : 'Agregar al carrito'}
                        </button>


                        <Link
                            to={rutaProductos}
                            className="btn btn-outline-secondary"
                        >
                            Volver
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}
