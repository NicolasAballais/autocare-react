import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    obtenerProductos,
    guardarProductos
} from '../data/productos';

export default function AdminProductoEditar() {

    const { id } = useParams();
    const navigate = useNavigate();

    const productos = obtenerProductos();

    const productoEncontrado = productos.find(
        (producto) => producto.id === Number(id)
    );

    const [formulario, setFormulario] = useState(
        productoEncontrado
            ? {
                codigo: productoEncontrado.codigo,
                nombre: productoEncontrado.nombre,
                descripcion: productoEncontrado.descripcion,
                precio: productoEncontrado.precio,
                stock: productoEncontrado.stock,
                stockCritico: productoEncontrado.stockCritico ?? '',
                categoria: productoEncontrado.categoria,
                imagen: productoEncontrado.imagen
            }
            : null
    );

    if (!productoEncontrado || !formulario) {
        return (
            <main className="container my-5 text-center">

                <h1>Producto no encontrado</h1>

                <button
                    type="button"
                    className="btn btn-outline-secondary mt-3"
                    onClick={() =>
                        navigate('/admin/productos')
                    }
                >
                    Volver
                </button>

            </main>
        );
    }

    const manejarCambio = (event) => {

        const { name, value } = event.target;

        setFormulario({
            ...formulario,
            [name]: value
        });
    };

    const actualizarProducto = (event) => {

        event.preventDefault();

        const codigoDuplicado = productos.some(
            (producto) =>
                producto.id !== productoEncontrado.id &&
                producto.codigo.toLowerCase() ===
                    formulario.codigo.trim().toLowerCase()
        );

        if (codigoDuplicado) {
            alert('Ya existe otro producto con ese código.');
            return;
        }

        const productosActualizados = productos.map(
            (producto) => {

                if (producto.id !== productoEncontrado.id) {
                    return producto;
                }

                return {
                    ...producto,
                    codigo: formulario.codigo.trim(),
                    nombre: formulario.nombre.trim(),
                    descripcion: formulario.descripcion.trim(),
                    precio: Number(formulario.precio),
                    stock: Number(formulario.stock),
                    stockCritico: Number(formulario.stockCritico),
                    categoria: formulario.categoria,
                    imagen: formulario.imagen.trim()
                };
            }
        );

        guardarProductos(productosActualizados);

        navigate('/admin/productos');
    };

    return (
        <main className="container my-5">

            <h1 className="mb-4">
                Editar Producto
            </h1>

            <div className="card shadow-sm">

                <div className="card-body">

                    <form onSubmit={actualizarProducto}>

                        <div className="row g-3">

                            <div className="col-md-4">

                                <label
                                    htmlFor="codigo"
                                    className="form-label"
                                >
                                    Código
                                </label>

                                <input
                                    type="text"
                                    id="codigo"
                                    name="codigo"
                                    className="form-control"
                                    value={formulario.codigo}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>

                            <div className="col-md-8">

                                <label
                                    htmlFor="nombre"
                                    className="form-label"
                                >
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    className="form-control"
                                    value={formulario.nombre}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>

                            <div className="col-12">

                                <label
                                    htmlFor="descripcion"
                                    className="form-label"
                                >
                                    Descripción
                                </label>

                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    className="form-control"
                                    rows="3"
                                    value={formulario.descripcion}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>

                            <div className="col-md-4">

                                <label
                                    htmlFor="precio"
                                    className="form-label"
                                >
                                    Precio
                                </label>

                                <input
                                    type="number"
                                    id="precio"
                                    name="precio"
                                    className="form-control"
                                    min="0"
                                    value={formulario.precio}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>

                            <div className="col-md-4">

                                <label
                                    htmlFor="stock"
                                    className="form-label"
                                >
                                    Stock
                                </label>

                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    className="form-control"
                                    min="0"
                                    value={formulario.stock}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>

                            <div className="col-md-4">

                                <label
                                    htmlFor="stockCritico"
                                    className="form-label"
                                >
                                    Stock crítico
                                </label>

                                <input
                                    type="number"
                                    id="stockCritico"
                                    name="stockCritico"
                                    className="form-control"
                                    min="0"
                                    value={formulario.stockCritico}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>

                            <div className="col-md-6">

                                <label
                                    htmlFor="categoria"
                                    className="form-label"
                                >
                                    Categoría
                                </label>

                                <select
                                    id="categoria"
                                    name="categoria"
                                    className="form-select"
                                    value={formulario.categoria}
                                    onChange={manejarCambio}
                                    required
                                >
                                    <option value="Aceites y Filtros">
                                        Aceites y Filtros
                                    </option>

                                    <option value="Detailing y Limpieza">
                                        Detailing y Limpieza
                                    </option>

                                    <option value="Ampolletas y Electricidad">
                                        Ampolletas y Electricidad
                                    </option>

                                    <option value="Accesorios">
                                        Accesorios
                                    </option>

                                </select>

                            </div>

                            <div className="col-md-6">

                                <label
                                    htmlFor="imagen"
                                    className="form-label"
                                >
                                    Ruta de imagen
                                </label>

                                <input
                                    type="text"
                                    id="imagen"
                                    name="imagen"
                                    className="form-control"
                                    value={formulario.imagen}
                                    onChange={manejarCambio}
                                    required
                                />

                            </div>

                        </div>

                        <div className="d-flex gap-2 mt-4">

                            <button
                                type="submit"
                                className="btn btn-danger"
                            >
                                Guardar cambios
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                    navigate('/admin/productos')
                                }
                            >
                                Cancelar
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </main>
    );
}