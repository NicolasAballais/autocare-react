import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    obtenerProductos,
    guardarProductos
} from '../data/productos';

export default function AdminProductoNuevo() {

    const navigate = useNavigate();

    const [formulario, setFormulario] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        stockCritico: '',
        categoria: '',
        imagen: ''
    });

    const manejarCambio = (event) => {

        const { name, value } = event.target;

        setFormulario({
            ...formulario,
            [name]: value
        });
    };

    const guardarProducto = (event) => {

        event.preventDefault();

        const productos = obtenerProductos();

        const codigoExiste = productos.some(
            (producto) =>
                producto.codigo.toLowerCase() ===
                formulario.codigo.trim().toLowerCase()
        );

        if (codigoExiste) {
            alert('Ya existe un producto con ese código.');
            return;
        }

        const nuevoProducto = {
            id: Date.now(),
            codigo: formulario.codigo.trim(),
            nombre: formulario.nombre.trim(),
            descripcion: formulario.descripcion.trim(),
            precio: Number(formulario.precio),
            stock: Number(formulario.stock),
            stockCritico: Number(formulario.stockCritico),
            categoria: formulario.categoria,
            imagen: formulario.imagen.trim()
        };

        guardarProductos([
            ...productos,
            nuevoProducto
        ]);

        navigate('/admin/productos');
    };

    return (
        <main className="container my-5">

            <h1 className="mb-4">
                Nuevo Producto
            </h1>

            <div className="card shadow-sm">

                <div className="card-body">

                    <form onSubmit={guardarProducto}>

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
                                    <option value="">
                                        Selecciona una categoría
                                    </option>

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
                                    placeholder="/images/producto.png"
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
                                Guardar producto
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