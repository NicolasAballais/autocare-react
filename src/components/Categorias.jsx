import { Link } from 'react-router-dom';
import { obtenerCategorias } from '../data/categorias';

function obtenerIcono(nombreCategoria) {

    switch (nombreCategoria) {

        case 'Aceites y Filtros':
            return 'bi-funnel-fill';

        case 'Detailing y Limpieza':
            return 'bi-droplet-half';

        case 'Ampolletas y Electricidad':
            return 'bi-lightning-charge-fill';

        case 'Accesorios':
            return 'bi-car-front-fill';

        default:
            return 'bi-grid-fill';
    }
}

function CategoriaCard({ categoria }) {

    const icono = obtenerIcono(categoria.nombre);

    return (
        <div className="col-md-6 col-lg-3">

            <Link
                to={`/categorias?categoria=${encodeURIComponent(categoria.nombre)}`}
                className="text-decoration-none text-dark"
            >

                <div className="p-4 border rounded shadow-sm bg-light h-100">

                    <i
                        className={`bi ${icono} fs-1 text-danger`}
                    ></i>

                    <h3 className="h5 mt-3">
                        {categoria.nombre}
                    </h3>

                </div>

            </Link>

        </div>
    );
}

export default function Categorias() {

    const categorias = obtenerCategorias();

    return (
        <section className="container my-5 text-center">

            <h2 className="mb-4">
                Categorías Principales
            </h2>

            {categorias.length === 0 ? (

                <div className="alert alert-info">
                    No existen categorías disponibles.
                </div>

            ) : (

                <div className="row g-4">

                    {categorias.map((categoria) => (

                        <CategoriaCard
                            key={categoria.id}
                            categoria={categoria}
                        />

                    ))}

                </div>

            )}

        </section>
    );
}