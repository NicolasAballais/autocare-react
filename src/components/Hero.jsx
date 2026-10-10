function Hero() {
    return (
        <section class="container text-center my-5 bg-dark-custom p-5 rounded shadow">
            <h1 >Bienvenido a AutoCare<span class="text-danger">Pro</span></h1>
            <p class="lead">Tu tienda online de confianza para repuestos y mantenimiento preventivo.</p>
            
            <div class="row justify-content-center mb-4">
                <div class="col-md-8">
                    <form
                        class="d-flex"
                        action="productos.html"
                        method="get">
                        <input
                            class="form-control form-control-lg me-2"
                            type="search"
                            id="busquedaInicio"
                            name="buscar"
                            placeholder="Busca repuestos, aceites, accesorios..."
                            aria-label="Buscar productos"/>
                        <button
                            class="btn btn-danger btn-lg"
                            type="submit">
                            Buscar
                        </button>
                    </form>
                </div>
            </div>
            <div class="row align-items-center mt-4">
                <div class="col-md-5">
                    <h2 class="p-3">Kits de Limpieza y Detailing en Oferta</h2>
                    <button class="btn btn-danger p-3 m-3 fs-5" onclick="window.location.href='productos.html'">
                        Ver catálogo completo
                    </button>
                </div>
                <div class="col-md-7">
                    <img src="images/Tienda.png" class="img-fluid rounded" alt="Tienda online AutoCare Pro" />
                </div>
            </div>
        </section>
    )
}

export default Hero;