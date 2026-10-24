import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    obtenerProductos,
    guardarProductos
} from '../data/productos';

import {
    obtenerCategorias
} from '../data/categorias';


export default function AdminProductoNuevo() {

    const navigate = useNavigate();

    const categorias = obtenerCategorias();


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


    function manejarCambio(evento) {

        const { name, value } = evento.target;

        setFormulario({
            ...formulario,
            [name]: value
        });
    }


    function guardarProducto(evento) {

        evento.preventDefault();

        const productos = obtenerProductos();

        const codigo =
            formulario.codigo.trim();

        const nombre =
            formulario.nombre.trim();


        if (codigo.length < 3) {

            alert(
                'El código debe tener al menos 3 caracteres.'
            );

            return;
        }


        if (!nombre) {

            alert(
                'El nombre del producto es obligatorio.'
            );

            return;
        }


        const codigoExiste =
            productos.some(
                (producto) =>
                    producto.codigo
                        .toLowerCase() ===
                    codigo.toLowerCase()
            );


        if (codigoExiste) {

            alert(
                'Ya existe un producto con ese código.'
            );

            return;
        }


        const nuevoProducto = {

            id: Date.now(),

            codigo,

            nombre,

            descripcion:
                formulario.descripcion.trim(),

            precio:
                Number(formulario.precio),

            stock:
                Number(formulario.stock),

            stockCritico:
                formulario.stockCritico === ''
                    ? 0
                    : Number(formulario.stockCritico),

            categoria:
                formulario.categoria,

            imagen:
                formulario.imagen.trim()
                || '/images/Tienda.png'
        };


        guardarProductos([
            ...productos,
            nuevoProducto
        ]);


        navigate(
            '/admin/productos'
        );
    }


    return (
        <main className="container my-5">

            <div className="mb-4">

                <h1 className="mb-1">
                    Nuevo Producto
                </h1>

                <p className="text-muted">
                    Registra un nuevo producto en el catálogo.
                </p>

            </div>


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
                                    minLength="3"
                                    required
                                />

                                <div className="form-text">
                                    Mínimo 3 caracteres.
                                </div>

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
                                    maxLength="100"
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
                                    maxLength="500"
                                />

                                <div className="form-text">
                                    Opcional. Máximo 500 caracteres.
                                </div>

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
                                    step="any"
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
                                    step="1"
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
                                    step="1"
                                    value={formulario.stockCritico}
                                    onChange={manejarCambio}
                                />

                                <div className="form-text">
                                    Opcional.
                                </div>

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

                                    {categorias.map(
                                        (categoria) => (

                                            <option
                                                key={categoria.id}
                                                value={categoria.nombre}
                                            >
                                                {categoria.nombre}
                                            </option>

                                        )
                                    )}

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
                                />

                                <div className="form-text">
                                    Opcional. Si se deja vacío se utilizará una imagen genérica.
                                </div>

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