import { Link } from 'react-router-dom';

function CategoriaCard({ nombre, icono, categoria }) {
    return (
        <div className="col-md-3">
            <Link
                to={`/productos?categoria=${encodeURIComponent(categoria)}`}
                className="text-decoration-none text-dark"
            >
                <div className="p-4 border rounded shadow-sm bg-light h-100">
                    <i className={`bi ${icono} fs-1 text-danger`}></i>

                    <h3 className="h5 mt-3">
                        {nombre}
                    </h3>
                </div>
            </Link>
        </div>
    );
}

export default function Categorias() {

    const categorias = [
        {
            nombre: 'Aceites & Filtros',
            categoria: 'Aceites y Filtros',
            icono: 'bi-funnel-fill'
        },
        {
            nombre: 'Detailing & Limpieza',
            categoria: 'Detailing y Limpieza',
            icono: 'bi-droplet-half'
        },
        {
            nombre: 'Ampolletas & Electricidad',
            categoria: 'Ampolletas y Electricidad',
            icono: 'bi-lightning-charge-fill'
        },
        {
            nombre: 'Accesorios',
            categoria: 'Accesorios',
            icono: 'bi-car-front-fill'
        }
    ];

    return (
        <section className="container my-5 text-center">

            <h2 className="mb-4">
                Categorías Principales
            </h2>

            <div className="row g-4">

                {categorias.map((categoria) => (
                    <CategoriaCard
                        key={categoria.categoria}
                        nombre={categoria.nombre}
                        categoria={categoria.categoria}
                        icono={categoria.icono}
                    />
                ))}

            </div>

        </section>
    );
}