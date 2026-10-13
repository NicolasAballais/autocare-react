export default function Productos() {
    return (
        <div>
            <div class="mb-4">
            <h1 class="mb-1">
                Catálogo de Productos
            </h1>
            <p
                class="text-muted"
                id="contadorProductos">
                0 productos disponibles
            </p>
            </div>

            <div class="row g-4">
                <aside class="col-lg-3">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="mb-3">
                                <i class="bi bi-funnel me-2"></i>
                                Filtros
                            </h5>
                            <p class="fw-bold mb-2">
                                Categorías
                            </p>
                            <div id="filtrosCategorias">
                            </div>
                            <button
                                type="button"
                                class="btn btn-outline-secondary btn-sm w-100 mt-3"
                                id="btnLimpiarFiltros">
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                </aside>

                <section class="col-lg-9">
                    <div class="row g-3 mb-4">
                        <div class="col-md-8">
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="bi bi-search"></i>
                                </span>
                                <input
                                    type="text"
                                    class="form-control"
                                    id="buscarProductos"
                                    placeholder="Buscar productos por nombre, categoría o descripción..."/>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <select
                                class="form-select"
                                id="ordenarProductos">
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

                    <div
                        class="row g-4"
                        id="contenedorProductos">
                    </div>
                    <div
                        class="text-center py-5"
                        id="sinResultadosCatalogo"
                        >
                        <i class="bi bi-search fs-1 text-muted"></i>
                        <h5 class="mt-3">
                            No se encontraron productos
                        </h5>
                        <p class="text-muted">
                            Intenta modificar la búsqueda o los filtros.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}