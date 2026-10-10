function Categorias(){
    return(
        <section class="container my-5 text-center">
            <h2 class="mb-4">
                Categorías Principales
            </h2>
            <div class="row g-4">
                
                <div class="col-md-3">
                    <a
                        href="productos.html?categoria=Aceites%20y%20Filtros"
                        class="text-decoration-none text-dark">
                        <div
                            class="p-4 border rounded shadow-sm bg-light h-100">
                            <i
                                class="bi bi-funnel-fill fs-1 text-danger">
                            </i>
                            <h3 class="h5 mt-3">
                                Aceites & Filtros
                            </h3>
                        </div>
                    </a>
                </div>
                
                <div class="col-md-3">
                    <a
                        href="productos.html?categoria=Detailing%20y%20Limpieza"
                        class="text-decoration-none text-dark">
                        <div
                            class="p-4 border rounded shadow-sm bg-light h-100">
                            <i
                                class="bi bi-droplet-half fs-1 text-danger">
                            </i>
                            <h3 class="h5 mt-3">
                                Detailing & Limpieza
                            </h3>
                        </div>
                    </a>
                </div>
                
                <div class="col-md-3">
                    <a
                        href="productos.html?categoria=Ampolletas%20y%20Electricidad"
                        class="text-decoration-none text-dark">
                        <div
                            class="p-4 border rounded shadow-sm bg-light h-100">
                            <i
                                class="bi bi-lightning-charge-fill fs-1 text-danger">
                            </i>
                            <h3 class="h5 mt-3">
                                Ampolletas & Electricidad
                            </h3>
                        </div>
                    </a>
                </div>
                
                <div class="col-md-3">
                    <a
                        href="productos.html?categoria=Accesorios"
                        class="text-decoration-none text-dark">
                        <div
                            class="p-4 border rounded shadow-sm bg-light h-100">
                            <i
                                class="bi bi-car-front-fill fs-1 text-danger">
                            </i>
                            <h3 class="h5 mt-3">
                                Accesorios
                            </h3>
                        </div>
                    </a>
                </div>
            </div>
        </section>
    )
}
export default Categorias;