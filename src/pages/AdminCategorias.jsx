import { useState } from 'react';

import {
    obtenerCategorias,
    guardarCategoria,
    actualizarCategoria,
    eliminarCategoria
} from '../data/categorias';

export default function AdminCategorias() {

    const [categorias, setCategorias] =
        useState(() => obtenerCategorias());

    const [nombre, setNombre] =
        useState('');

    const [categoriaEditando, setCategoriaEditando] =
        useState(null);

    const [mensaje, setMensaje] =
        useState('');

    const [tipoMensaje, setTipoMensaje] =
        useState('');

    function recargarCategorias() {
        setCategorias(
            obtenerCategorias()
        );
    }

    function limpiarFormulario() {

        setNombre('');
        setCategoriaEditando(null);
    }

    function manejarEnvio(event) {

        event.preventDefault();

        setMensaje('');
        setTipoMensaje('');

        let resultado;

        if (categoriaEditando) {

            resultado =
                actualizarCategoria(
                    categoriaEditando.id,
                    nombre
                );

        } else {

            resultado =
                guardarCategoria(nombre);
        }

        if (!resultado.exito) {

            setMensaje(resultado.mensaje);
            setTipoMensaje('danger');
            return;
        }

        if (categoriaEditando) {

            setMensaje(
                'Categoría actualizada correctamente.'
            );

        } else {

            setMensaje(
                'Categoría creada correctamente.'
            );
        }

        setTipoMensaje('success');

        limpiarFormulario();
        recargarCategorias();
    }

    function editarCategoria(categoria) {

        setCategoriaEditando(categoria);
        setNombre(categoria.nombre);

        setMensaje('');
        setTipoMensaje('');
    }

    function cancelarEdicion() {

        limpiarFormulario();

        setMensaje('');
        setTipoMensaje('');
    }

    function borrarCategoria(categoria) {

        const confirmar =
            window.confirm(
                `¿Deseas eliminar la categoría "${categoria.nombre}"?`
            );

        if (!confirmar) {
            return;
        }

        const resultado =
            eliminarCategoria(categoria.id);

        if (!resultado.exito) {

            setMensaje(resultado.mensaje);
            setTipoMensaje('danger');
            return;
        }

        setMensaje(
            'Categoría eliminada correctamente.'
        );

        setTipoMensaje('success');

        recargarCategorias();
    }

    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Administración de Categorías
                </h1>

                <p className="text-muted">
                    Crear, editar y eliminar categorías de productos.
                </p>

            </div>

            <div className="row g-4">

                {/* FORMULARIO */}

                <div className="col-lg-4">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h4 className="mb-3">
                                {categoriaEditando
                                    ? 'Editar categoría'
                                    : 'Nueva categoría'
                                }
                            </h4>

                            {mensaje && (

                                <div
                                    className={`alert alert-${tipoMensaje}`}
                                >
                                    {mensaje}
                                </div>

                            )}

                            <form
                                onSubmit={manejarEnvio}
                            >

                                <div className="mb-3">

                                    <label
                                        htmlFor="nombre"
                                        className="form-label"
                                    >
                                        Nombre
                                    </label>

                                    <input
                                        id="nombre"
                                        type="text"
                                        className="form-control"
                                        value={nombre}
                                        onChange={(event) =>
                                            setNombre(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>

                                <div className="d-flex gap-2">

                                    <button
                                        type="submit"
                                        className="btn btn-danger"
                                    >
                                        {categoriaEditando
                                            ? 'Guardar cambios'
                                            : 'Crear categoría'
                                        }
                                    </button>

                                    {categoriaEditando && (

                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={cancelarEdicion}
                                        >
                                            Cancelar
                                        </button>

                                    )}

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

                {/* LISTADO */}

                <div className="col-lg-8">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <h4 className="mb-0">
                                    Categorías registradas
                                </h4>

                                <span className="badge text-bg-secondary">
                                    {categorias.length}
                                </span>

                            </div>

                            <div className="table-responsive">

                                <table className="table align-middle">

                                    <thead>

                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Acciones</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {categorias.map(
                                            (categoria) => (

                                                <tr key={categoria.id}>

                                                    <td>
                                                        {categoria.id}
                                                    </td>

                                                    <td>
                                                        {categoria.nombre}
                                                    </td>

                                                    <td>

                                                        <div className="d-flex gap-2">

                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={() =>
                                                                    editarCategoria(
                                                                        categoria
                                                                    )
                                                                }
                                                            >
                                                                Editar
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() =>
                                                                    borrarCategoria(
                                                                        categoria
                                                                    )
                                                                }
                                                            >
                                                                Eliminar
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}