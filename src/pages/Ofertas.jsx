import { Link } from 'react-router-dom';
import { RUTA_CATALOGO_CONECTADO, useCatalogoConectado } from '../context/catalogo';

import {
    IMAGEN_PRODUCTO_ALTERNATIVA,
    mostrarImagenProductoAlternativa,
    obtenerProductos,
    obtenerDescuentoProducto,
    obtenerPrecioFinalProducto,
    productoEstaEnOferta,
    productoTieneStockCritico
} from '../services/productosService';


export default function Ofertas() {

    const catalogo = useCatalogoConectado();
    const conectado = Boolean(catalogo);
    const rutaProductos = conectado ? RUTA_CATALOGO_CONECTADO : '/productos';
    const productos = conectado ? catalogo.productos : obtenerProductos();


    const productosEnOferta = productos
        .filter(productoEstaEnOferta)
        .map((producto) => ({
            ...producto,

            descuento:
                obtenerDescuentoProducto(producto),

            precioOferta:
                conectado ? producto.precioFinal : obtenerPrecioFinalProducto(producto)
        }));


    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Ofertas
                </h1>

                <p className="text-muted">
                    Revisa los productos que actualmente tienen descuentos especiales.
                </p>

            </div>


            {productosEnOferta.length === 0 ? (

                <div className="alert alert-info">
                    Actualmente no existen productos en oferta.
                </div>

            ) : (

                <div className="row g-4">

                    {productosEnOferta.map(
                        (producto) => (

                            <div
                                className="col-md-6 col-lg-4"
                                key={producto.id}
                            >

                                <div className="card h-100 shadow-sm">

                                    <img
                                        src={producto.imagen || IMAGEN_PRODUCTO_ALTERNATIVA}
                                        onError={mostrarImagenProductoAlternativa}
                                        className="card-img-top"
                                        alt={producto.nombre}
                                        style={{
                                            height: '220px',
                                            objectFit: 'contain',
                                            padding: '20px'
                                        }}
                                    />


                                    <div className="card-body d-flex flex-column">

                                        <div className="mb-2">

                                            <span className="badge text-bg-danger">
                                                -{producto.descuento}%
                                            </span>

                                        </div>


                                        <h5 className="card-title">
                                            {producto.nombre}
                                        </h5>


                                        <p className="card-text text-muted">
                                            {producto.descripcion}
                                        </p>


                                        <div className="mt-auto">

                                            <div className="mb-1">

                                                <span className="text-muted text-decoration-line-through">
                                                    ${producto.precio.toLocaleString('es-CL')}
                                                </span>

                                            </div>


                                            <h4 className="text-danger mb-3">
                                                ${producto.precioOferta.toLocaleString('es-CL')}
                                            </h4>

                                            {producto.stock <= 0 && <p className="text-danger fw-bold">Agotado</p>}
                                            {productoTieneStockCritico(producto) && <p className="fw-bold">Stock crítico</p>}

                                            <Link
                                                to={`${rutaProductos}/${producto.id}`}
                                                className="btn btn-danger w-100"
                                            >
                                                Ver producto
                                            </Link>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

        </main>
    );
}
