import { Link } from 'react-router-dom';

import {
    obtenerBlogs
} from '../data/blogs';


export default function Blog() {

    const blogs = obtenerBlogs();


    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Blog AutoCarePro
                </h1>

                <p className="text-muted">
                    Consejos, información y novedades para el cuidado de tu vehículo.
                </p>

            </div>


            <div className="row g-4">

                {blogs.map((blog) => (

                    <div
                        className="col-md-6"
                        key={blog.id}
                    >

                        <div className="card shadow-sm h-100">

                            <img
                                src={blog.imagen}
                                className="card-img-top"
                                alt={blog.titulo}
                                style={{
                                    height: '260px',
                                    objectFit: 'contain',
                                    padding: '20px'
                                }}
                            />


                            <div className="card-body d-flex flex-column">

                                <h4 className="card-title">
                                    {blog.titulo}
                                </h4>

                                <p className="card-text text-muted">
                                    {blog.resumen}
                                </p>


                                <Link
                                    to={`/blog/${blog.id}`}
                                    className="btn btn-outline-danger mt-auto"
                                >
                                    Leer artículo
                                </Link>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </main>
    );
}