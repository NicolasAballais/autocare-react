import { useMemo, useState } from 'react';

import {
    Link,
    useSearchParams
} from 'react-router-dom';

import {
    obtenerProductos,
    obtenerDescuentoProducto,
    obtenerPrecioFinalProducto,
    productoEstaEnOferta
} from '../services/productosService';

import {
    obtenerCategorias
} from '../services/categoriasService';

import {
    useCarrito
} from '../context/CarritoContext';


export default function Productos() {

    const productos = obtenerProductos();
    const categorias = obtenerCategorias();

    const {
        agregarProducto
    } = useCarrito();

    const [
        searchParams,
        setSearchParams
    ] = useSearchParams();


    const categoriasSeleccionadas =
        searchParams.getAll('categoria');


    const [busqueda, setBusqueda] =
        useState('');

    const [orden, setOrden] =
        useState('');


    const productosFiltrados =
        useMemo(() => {

            let resultado = [...productos];


            if (
                categoriasSeleccionadas.length > 0
            ) {

                resultado =
                    resultado.filter(
                        (producto) =>
                            categoriasSeleccionadas.includes(
                                producto.categoria
                            )
                    );
            }


            if (busqueda.trim()) {

                const texto =
                    busqueda
                        .trim()
                        .toLowerCase();


                resultado =
                    resultado.filter(
                        (producto) =>

                            producto.nombre
                                .toLowerCase()
                                .includes(texto)

                            ||

                            producto.categoria
                                .toLowerCase()
                                .includes(texto)

                            ||

                            producto.descripcion
                                .toLowerCase()
                                .includes(texto)
                    );
            }


            if (orden === 'precio-menor') {

                resultado.sort(
                    (a, b) =>
                        obtenerPrecioFinalProducto(a)
                        -
                        obtenerPrecioFinalProducto(b)
                );
            }


            if (orden === 'precio-mayor') {

                resultado.sort(
                    (a, b) =>
                        obtenerPrecioFinalProducto(b)
                        -
                        obtenerPrecioFinalProducto(a)
                );
            }


            if (orden === 'nombre') {

                resultado.sort(
                    (a, b) =>
                        a.nombre.localeCompare(
                            b.nombre
                        )
                );
            }


            return resultado;

        }, [
            productos,
            categoriasSeleccionadas,
            busqueda,
            orden
        ]);


    function alternarCategoria(
        nombreCategoria
    ) {

        const nuevasCategorias =
            categoriasSeleccionadas.includes(
                nombreCategoria
            )
                ? categoriasSeleccionadas.filter(
                    (categoria) =>
                        categoria !==
                        nombreCategoria
                )
                : [
                    ...categoriasSeleccionadas,
                    nombreCategoria
                ];


        const nuevosParametros =
            new URLSearchParams();


        nuevasCategorias.forEach(
            (categoria) => {

                nuevosParametros.append(
                    'categoria',
                    categoria
                );

            }
        );


        setSearchParams(
            nuevosParametros
        );
    }


    function limpiarFiltros() {

        setSearchParams({});
        setBusqueda('');
        setOrden('');
    }


    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Catálogo de Productos
                </h1>

                <p className="text-muted">
                    {productosFiltrados.length} productos disponibles
                </p>

            </div>


            <div className="row g-4">

                {/* FILTROS */}

                <aside className="col-lg-3">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h5 className="mb-3">
                                <i className="bi bi-funnel me-2"></i>
                                Filtros
                            </h5>


                            <strong>
                                Categorías
                            </strong>


                            <div className="d-grid gap-2 mt-2">

                                {categorias.map(
                                    (categoria) => {

                                        const activa =
                                            categoriasSeleccionadas.includes(
                                                categoria.nombre
                                            );

                                        return (

                                            <button
                                                key={categoria.id}
                                                type="button"
                                                className={
                                                    activa
                                                        ? 'btn btn-danger btn-sm'
                                                        : 'btn btn-outline-secondary btn-sm'
                                                }
                                                onClick={() =>
                                                    alternarCategoria(
                                                        categoria.nombre
                                                    )
                                                }
                                            >
                                                {categoria.nombre}
                                            </button>

                                        );

                                    }
                                )}


                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={limpiarFiltros}
                                >
                                    Limpiar filtros
                                </button>

                            </div>

                        </div>

                    </div>

                </aside>


                {/* PRODUCTOS */}

                <section className="col-lg-9">

                    <div className="row g-3 mb-3">

                        <div className="col-md-8">

                            <div className="input-group">

                                <span className="input-group-text">
                                    <i className="bi bi-search"></i>
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar productos por nombre, categoría o descripción..."
                                    value={busqueda}
                                    onChange={(evento) =>
                                        setBusqueda(
                                            evento.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>


                        <div className="col-md-4">

                            <select
                                className="form-select"
                                value={orden}
                                onChange={(evento) =>
                                    setOrden(
                                        evento.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Ordenar por
                                </option>

                                <option value="precio-menor">
                                    Precio menor
                                </option>

                                <option value="precio-mayor">
                                    Precio mayor
                                </option>

                                <option value="nombre">
                                    Nombre
                                </option>

                            </select>

                        </div>

                    </div>


                    {productosFiltrados.length === 0 ? (

                        <div className="alert alert-info">
                            No se encontraron productos con los filtros seleccionados.
                        </div>

                    ) : (

                        <div className="row g-4">

                            {productosFiltrados.map(
                                (producto) => {

                                    const descuento =
                                        obtenerDescuentoProducto(
                                            producto
                                        );

                                    const precioFinal =
                                        obtenerPrecioFinalProducto(
                                            producto
                                        );

                                    const enOferta =
                                        productoEstaEnOferta(
                                            producto
                                        );


                                    return (

                                        <div
                                            key={producto.id}
                                            className="col-md-6 col-xl-4"
                                        >

                                            <div className="card shadow-sm h-100">

                                                <img
                                                    src={producto.imagen}
                                                    className="card-img-top"
                                                    alt={producto.nombre}
                                                    style={{
                                                        height: '220px',
                                                        objectFit: 'contain',
                                                        padding: '15px'
                                                    }}
                                                />


                                                <div className="card-body d-flex flex-column">

                                                    <div className="mb-2">

                                                        <span className="badge text-bg-secondary">
                                                            {producto.categoria}
                                                        </span>

                                                        {enOferta && (

                                                            <span className="badge text-bg-danger ms-2">
                                                                -{descuento}%
                                                            </span>

                                                        )}

                                                    </div>


                                                    <h5 className="card-title">
                                                        {producto.nombre}
                                                    </h5>


                                                    <p className="card-text text-muted">
                                                        {producto.descripcion}
                                                    </p>


                                                    <div className="mt-auto">

                                                        {enOferta ? (

                                                            <>
                                                                <div className="text-muted text-decoration-line-through">
                                                                    ${producto.precio.toLocaleString('es-CL')}
                                                                </div>

                                                                <h5 className="text-danger">
                                                                    ${precioFinal.toLocaleString('es-CL')}
                                                                </h5>
                                                            </>

                                                        ) : (

                                                            <h5 className="text-danger">
                                                                ${producto.precio.toLocaleString('es-CL')}
                                                            </h5>

                                                        )}


                                                        <p className="mb-2">
                                                            Stock: {producto.stock}
                                                        </p>


                                                        {
                                                            producto.stock <=
                                                            producto.stockCritico
                                                            && (

                                                                <div className="alert alert-warning py-2">
                                                                    Stock crítico
                                                                </div>

                                                            )
                                                        }


                                                        <div className="d-flex gap-2">

                                                            <Link
                                                                to={`/productos/${producto.id}`}
                                                                className="btn btn-outline-secondary flex-grow-1"
                                                            >
                                                                Ver detalle
                                                            </Link>


                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                disabled={
                                                                    producto.stock <= 0
                                                                }
                                                                onClick={() =>
                                                                    agregarProducto({
                                                                        ...producto,

                                                                        precioOriginal:
                                                                            producto.precio,

                                                                        precio:
                                                                            precioFinal,

                                                                        descuento
                                                                    })
                                                                }
                                                            >
                                                                <i className="bi bi-cart-plus"></i>
                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>

            </div>

        </main>
    );
}