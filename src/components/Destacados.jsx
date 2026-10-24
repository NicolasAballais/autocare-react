import { Link } from 'react-router-dom';
import { obtenerProductos } from '../data/productos';


export default function Destacados() {

    const productos = obtenerProductos();

    const productosDestacados =
        productos.slice(0, 3);


    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });


    return (
        <section className="container my-5">

            <div className="text-center mb-4">

                <h2>
                    Productos Destacados
                </h2>

                <p className="text-muted">
                    Algunos de nuestros productos disponibles.
                </p>

            </div>


            {productosDestacados.length === 0 ? (

                <div className="alert alert-info">
                    No existen productos disponibles.
                </div>

            ) : (

                <div className="row g-4">

                    {productosDestacados.map((producto) => (

                        <div
                            className="col-md-6 col-lg-4"
                            key={producto.id}
                        >

                            <div className="card shadow-sm h-100">

                                <img
                                    src={producto.imagen}
                                    className="card-img-top"
                                    alt={producto.nombre}
                                    style={{
                                        height: '220px',
                                        objectFit: 'contain',
                                        padding: '20px'
                                    }}
                                />


                                <div className="card-body d-flex flex-column">

                                    <h5 className="card-title">
                                        {producto.nombre}
                                    </h5>

                                    <p className="card-text text-muted">
                                        {producto.descripcion}
                                    </p>


                                    <h5 className="text-danger mt-auto mb-3">
                                        {formatoPrecio.format(producto.precio)}
                                    </h5>


                                    <Link
                                        to={`/productos/${producto.id}`}
                                        className="btn btn-outline-danger"
                                    >
                                        Ver detalle
                                    </Link>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}


            <div className="text-center mt-4">

                <Link
                    to="/productos"
                    className="btn btn-danger"
                >
                    Ver todos los productos
                </Link>

            </div>

        </section>
    );
}