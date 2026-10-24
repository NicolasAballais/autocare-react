import { Link, useParams } from 'react-router-dom';

import {
    obtenerBlogPorId
} from '../data/blogs';


export default function BlogDetalle() {

    const { id } = useParams();

    const blog = obtenerBlogPorId(id);


    if (!blog) {

        return (
            <main className="container my-5">

                <div className="alert alert-warning">
                    El artículo solicitado no existe.
                </div>

                <Link
                    to="/blog"
                    className="btn btn-danger"
                >
                    Volver al blog
                </Link>

            </main>
        );
    }


    return (
        <main className="container my-5">

            <div className="mb-4">

                <Link
                    to="/blog"
                    className="btn btn-outline-secondary mb-3"
                >
                    Volver al blog
                </Link>

                <h1>
                    {blog.titulo}
                </h1>

                <p className="text-muted">
                    {blog.resumen}
                </p>

            </div>


            <div className="card shadow-sm">

                <div className="card-body">

                    <div className="text-center mb-4">

                        <img
                            src={blog.imagen}
                            alt={blog.titulo}
                            className="img-fluid"
                            style={{
                                maxHeight: '420px',
                                objectFit: 'contain'
                            }}
                        />

                    </div>


                    {blog.contenido.map(
                        (parrafo, indice) => (

                            <p
                                key={indice}
                                className="mb-3"
                            >
                                {parrafo}
                            </p>

                        )
                    )}

                </div>

            </div>

        </main>
    );
}