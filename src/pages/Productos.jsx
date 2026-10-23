import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { obtenerProductos } from '../data/productos';

function ProductoCard({ producto }) {
    const precioFormateado = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    }).format(producto.precio);

    const stockCritico =
        producto.stock > 0 &&
        producto.stock <= producto.stockCritico;

    return (
        <div className="col-md-6 col-xl-4">
            <div className="card h-100 shadow-sm">

                <img
                    src={producto.imagen}
                    className="card-img-top"
                    alt={producto.nombre}
                    style={{
                        height: '220px',
                        objectFit: 'cover'
                    }}
                />

                <div className="card-body d-flex flex-column">

                    <span className="badge text-bg-secondary mb-2 align-self-start">
                        {producto.categoria}
                    </span>

                    <h5 className="card-title">
                        {producto.nombre}
                    </h5>

                    <p className="card-text text-muted">
                        {producto.descripcion}
                    </p>

                    <p className="fw-bold fs-5 text-danger mb-2">
                        {precioFormateado}
                    </p>

                    <p className="mb-1">
                        Stock: {producto.stock}
                    </p>

                    {stockCritico && (
                        <div className="alert alert-warning py-1 px-2 mt-2 mb-0">
                            Stock crítico
                        </div>
                    )}

                    {producto.stock === 0 && (
                        <div className="alert alert-danger py-1 px-2 mt-2 mb-0">
                            Producto agotado
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default function Productos() {

    const [productos] = useState(() => obtenerProductos());

    const [searchParams, setSearchParams] = useSearchParams();

    const busquedaURL = searchParams.get('buscar') || '';
    const categoriaSeleccionada =
        searchParams.get('categoria') || '';

    const [busqueda, setBusqueda] =
        useState(busquedaURL);

    const [orden, setOrden] =
        useState('original');

    useEffect(() => {
        setBusqueda(busquedaURL);
    }, [busquedaURL]);

    const categorias = useMemo(() => {
        return [
            ...new Set(
                productos.map(
                    (producto) => producto.categoria
                )
            )
        ];
    }, [productos]);

    const manejarBusqueda = (event) => {
        const valor = event.target.value;

        setBusqueda(valor);

        const nuevosParametros =
            new URLSearchParams(searchParams);

        if (valor.trim()) {
            nuevosParametros.set('buscar', valor);
        } else {
            nuevosParametros.delete('buscar');
        }

        setSearchParams(
            nuevosParametros,
            { replace: true }
        );
    };

    const seleccionarCategoria = (categoria) => {
        const nuevosParametros =
            new URLSearchParams(searchParams);

        nuevosParametros.set(
            'categoria',
            categoria
        );

        setSearchParams(nuevosParametros);
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setOrden('original');
        setSearchParams({});
    };

    const productosFiltrados = useMemo(() => {

        let resultado = [...productos];

        const texto =
            busqueda.trim().toLowerCase();

        if (texto) {
            resultado = resultado.filter(
                (producto) =>
                    producto.nombre
                        .toLowerCase()
                        .includes(texto) ||

                    producto.descripcion
                        .toLowerCase()
                        .includes(texto) ||

                    producto.categoria
                        .toLowerCase()
                        .includes(texto) ||

                    producto.codigo
                        .toLowerCase()
                        .includes(texto)
            );
        }

        if (categoriaSeleccionada) {
            resultado = resultado.filter(
                (producto) =>
                    producto.categoria ===
                    categoriaSeleccionada
            );
        }

        switch (orden) {

            case 'precio-asc':
                resultado.sort(
                    (a, b) => a.precio - b.precio
                );
                break;

            case 'precio-desc':
                resultado.sort(
                    (a, b) => b.precio - a.precio
                );
                break;

            case 'nombre-asc':
                resultado.sort(
                    (a, b) =>
                        a.nombre.localeCompare(b.nombre)
                );
                break;

            default:
                break;
        }

        return resultado;

    }, [
        productos,
        busqueda,
        categoriaSeleccionada,
        orden
    ]);

    return (
        <main className="container my-4">

            <div className="mb-4">

                <h1 className="mb-1">
                    Catálogo de Productos
                </h1>

                <p className="text-muted">
                    {productosFiltrados.length}
                    {' '}
                    productos disponibles
                </p>

            </div>

            <div className="row g-4">

                <aside className="col-lg-3">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h5 className="mb-3">
                                <i className="bi bi-funnel me-2"></i>
                                Filtros
                            </h5>

                            <p className="fw-bold mb-2">
                                Categorías
                            </p>

                            <div className="d-grid gap-2">

                                {categorias.map(
                                    (categoria) => (

                                        <button
                                            key={categoria}
                                            type="button"
                                            className={
                                                categoriaSeleccionada === categoria
                                                    ? 'btn btn-danger btn-sm'
                                                    : 'btn btn-outline-secondary btn-sm'
                                            }
                                            onClick={() =>
                                                seleccionarCategoria(
                                                    categoria
                                                )
                                            }
                                        >
                                            {categoria}
                                        </button>

                                    )
                                )}

                            </div>

                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm w-100 mt-3"
                                onClick={limpiarFiltros}
                            >
                                Limpiar filtros
                            </button>

                        </div>

                    </div>

                </aside>

                <section className="col-lg-9">

                    <div className="row g-3 mb-4">

                        <div className="col-md-8">

                            <div className="input-group">

                                <span className="input-group-text">
                                    <i className="bi bi-search"></i>
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={busqueda}
                                    onChange={manejarBusqueda}
                                    placeholder="Buscar productos por nombre, categoría o descripción..."
                                />

                            </div>

                        </div>

                        <div className="col-md-4">

                            <select
                                className="form-select"
                                value={orden}
                                onChange={(event) =>
                                    setOrden(event.target.value)
                                }
                            >

                                <option value="original">
                                    Ordenar por
                                </option>

                                <option value="precio-asc">
                                    Precio: Menor a Mayor
                                </option>

                                <option value="precio-desc">
                                    Precio: Mayor a Menor
                                </option>

                                <option value="nombre-asc">
                                    Nombre: A-Z
                                </option>

                            </select>

                        </div>

                    </div>

                    {productosFiltrados.length > 0 ? (

                        <div className="row g-4">

                            {productosFiltrados.map(
                                (producto) => (

                                    <ProductoCard
                                        key={producto.id}
                                        producto={producto}
                                    />

                                )
                            )}

                        </div>

                    ) : (

                        <div className="text-center py-5">

                            <i className="bi bi-search fs-1 text-muted"></i>

                            <h5 className="mt-3">
                                No se encontraron productos
                            </h5>

                            <p className="text-muted">
                                Intenta modificar la búsqueda o los filtros.
                            </p>

                        </div>

                    )}

                </section>

            </div>

        </main>
    );
}