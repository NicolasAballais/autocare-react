import { Link, useSearchParams } from 'react-router-dom';

import { obtenerCategorias } from '../services/categoriasService';
import {
    IMAGEN_PRODUCTO_ALTERNATIVA,
    mostrarImagenProductoAlternativa,
    obtenerProductos,
    productoTieneStockCritico
} from '../services/productosService';
import { RUTA_CATALOGO_CONECTADO, useCatalogoConectado } from '../context/catalogo';

export default function Categorias() {

    const catalogo = useCatalogoConectado();
    const conectado = Boolean(catalogo);
    const rutaProductos = conectado ? RUTA_CATALOGO_CONECTADO : '/productos';
    const categorias = conectado ? catalogo.categorias : obtenerCategorias();
    const productos = conectado ? catalogo.productos : obtenerProductos();
    const [searchParams, setSearchParams] = useSearchParams();

    function valorCategoria(categoria) {
        return conectado ? categoria.id : categoria.nombre;
    }

    let seleccion = searchParams.get('categoria');
    if (!seleccion) {
        const primeraConProductos = conectado
            ? categorias.find((categoria) => productos.some((producto) => producto.categoriaId === categoria.id))
            : undefined;
        const categoriaInicial = primeraConProductos ?? categorias[0];
        seleccion = categoriaInicial ? valorCategoria(categoriaInicial) : '';
    }

    const categoriaSeleccionada = categorias.find((categoria) => valorCategoria(categoria) === seleccion);
    const nombreCategoria = conectado ? categoriaSeleccionada?.nombre ?? 'Productos por categoría' : seleccion;
    const productosCategoria = productos.filter(
        (producto) => (conectado ? producto.categoriaId : producto.categoria) === seleccion
    );

    const formatoPrecio = new Intl.NumberFormat(
        'es-CL',
        {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }
    );

    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Categorías
                </h1>

                <p className="text-muted">
                    Explora nuestros productos por categoría.
                </p>

            </div>

            {/* CATEGORÍAS */}

            <div className="row g-4 mb-5">

                {categorias.map((categoria) => (

                    <div
                        key={categoria.id}
                        className="col-md-6 col-lg-3"
                    >

                        <div
                            className={
                                categoriaSeleccionada === categoria
                                    ? 'card shadow-sm h-100 border-danger'
                                    : 'card shadow-sm h-100'
                            }
                        >

                            <div className="card-body text-center">

                                <i className="bi bi-grid fs-1 text-danger"></i>

                                <h4 className="mt-3">
                                    {categoria.nombre}
                                </h4>

                                <button
                                    type="button"
                                    className={
                                        categoriaSeleccionada === categoria
                                            ? 'btn btn-danger mt-3'
                                            : 'btn btn-outline-danger mt-3'
                                    }
                                    aria-pressed={categoriaSeleccionada === categoria}
                                    onClick={() => setSearchParams({ categoria: valorCategoria(categoria) })}
                                >
                                    Ver productos
                                </button>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

            {/* PRODUCTOS */}

            <div className="mb-4">

                <h2>
                    {nombreCategoria}
                </h2>

                <p className="text-muted">
                    Productos disponibles en esta categoría.
                </p>

            </div>

            {productosCategoria.length === 0 ? (

                <div className="alert alert-info">
                    No existen productos disponibles en esta categoría.
                </div>

            ) : (

                <div className="row g-4">

                    {productosCategoria.map((producto) => (

                        <div
                            key={producto.id}
                            className="col-md-6 col-lg-4"
                        >

                            <div className="card shadow-sm h-100">

                                <img
                                    src={producto.imagen || IMAGEN_PRODUCTO_ALTERNATIVA}
                                    onError={mostrarImagenProductoAlternativa}
                                    className="card-img-top"
                                    alt={producto.nombre}
                                    style={{
                                        height: '220px',
                                        objectFit: 'contain'
                                    }}
                                />

                                <div className="card-body d-flex flex-column">

                                    <h5 className="card-title">
                                        {producto.nombre}
                                    </h5>

                                    <p className="text-muted">
                                        {producto.descripcion}
                                    </p>

                                    {conectado && producto.descuento > 0 && (
                                        <div className="text-muted text-decoration-line-through">
                                            {formatoPrecio.format(producto.precio)}
                                        </div>
                                    )}
                                    <p className="fw-bold text-danger fs-5">
                                        {formatoPrecio.format(
                                            conectado ? producto.precioFinal : producto.precio
                                        )}
                                    </p>

                                    <p className="mb-2">
                                        Stock: {producto.stock}
                                    </p>
                                    {producto.stock <= 0 && <p className="text-danger fw-bold">Agotado</p>}
                                    {productoTieneStockCritico(producto) && <p className="fw-bold">Stock crítico</p>}

                                    <Link
                                        to={`${rutaProductos}/${producto.id}`}
                                        className="btn btn-outline-danger mt-auto"
                                    >
                                        Ver detalle
                                    </Link>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </main>
    );
}
