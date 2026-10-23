import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { obtenerCategorias } from '../data/categorias';
import { obtenerProductos } from '../data/productos';

export default function Categorias() {

    const categorias = obtenerCategorias();
    const productos = obtenerProductos();

    const [searchParams] = useSearchParams();

    const categoriaURL =
        searchParams.get('categoria');

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(
        categoriaURL ||
        (
            categorias.length > 0
                ? categorias[0].nombre
                : ''
        )
    );

    const productosCategoria = productos.filter(
        (producto) =>
            producto.categoria === categoriaSeleccionada
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
                                categoriaSeleccionada === categoria.nombre
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
                                        categoriaSeleccionada === categoria.nombre
                                            ? 'btn btn-danger mt-3'
                                            : 'btn btn-outline-danger mt-3'
                                    }
                                    onClick={() =>
                                        setCategoriaSeleccionada(
                                            categoria.nombre
                                        )
                                    }
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
                    {categoriaSeleccionada}
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
                                    src={producto.imagen}
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

                                    <p className="fw-bold text-danger fs-5">
                                        {formatoPrecio.format(
                                            producto.precio
                                        )}
                                    </p>

                                    <p className="mb-3">
                                        Stock: {producto.stock}
                                    </p>

                                    <Link
                                        to={`/productos/${producto.id}`}
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