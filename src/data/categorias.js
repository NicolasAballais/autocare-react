import {
    obtenerProductos,
    guardarProductos
} from './productos';

const CLAVE_CATEGORIAS = 'categoriasAutoCare';

const CATEGORIAS_INICIALES = [
    {
        id: 1,
        nombre: 'Aceites y Filtros'
    },
    {
        id: 2,
        nombre: 'Detailing y Limpieza'
    },
    {
        id: 3,
        nombre: 'Ampolletas y Electricidad'
    },
    {
        id: 4,
        nombre: 'Accesorios'
    }
];


export function obtenerCategorias() {

    const datos = localStorage.getItem(
        CLAVE_CATEGORIAS
    );

    if (datos) {
        return JSON.parse(datos);
    }

    localStorage.setItem(
        CLAVE_CATEGORIAS,
        JSON.stringify(CATEGORIAS_INICIALES)
    );

    return [...CATEGORIAS_INICIALES];
}


export function guardarCategoria(nombre) {

    const categorias = obtenerCategorias();

    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {

        return {
            exito: false,
            mensaje: 'El nombre de la categoría es obligatorio.'
        };
    }

    const nombreExiste = categorias.some(
        (categoria) =>
            categoria.nombre.toLowerCase() ===
            nombreLimpio.toLowerCase()
    );

    if (nombreExiste) {

        return {
            exito: false,
            mensaje: 'Ya existe una categoría con ese nombre.'
        };
    }

    const nuevaCategoria = {
        id: Date.now(),
        nombre: nombreLimpio
    };

    const categoriasActualizadas = [
        ...categorias,
        nuevaCategoria
    ];

    localStorage.setItem(
        CLAVE_CATEGORIAS,
        JSON.stringify(categoriasActualizadas)
    );

    return {
        exito: true,
        categoria: nuevaCategoria
    };
}


export function actualizarCategoria(id, nombre) {

    const categorias = obtenerCategorias();

    const categoriaActual = categorias.find(
        (categoria) =>
            categoria.id === Number(id)
    );

    if (!categoriaActual) {

        return {
            exito: false,
            mensaje: 'Categoría no encontrada.'
        };
    }

    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {

        return {
            exito: false,
            mensaje: 'El nombre de la categoría es obligatorio.'
        };
    }

    const nombreDuplicado = categorias.some(
        (categoria) =>
            categoria.id !== Number(id) &&
            categoria.nombre.toLowerCase() ===
                nombreLimpio.toLowerCase()
    );

    if (nombreDuplicado) {

        return {
            exito: false,
            mensaje: 'Ya existe otra categoría con ese nombre.'
        };
    }

    const nombreAnterior =
        categoriaActual.nombre;

    const categoriasActualizadas =
        categorias.map((categoria) => {

            if (
                categoria.id !== Number(id)
            ) {
                return categoria;
            }

            return {
                ...categoria,
                nombre: nombreLimpio
            };
        });

    localStorage.setItem(
        CLAVE_CATEGORIAS,
        JSON.stringify(categoriasActualizadas)
    );

    // Actualizar también los productos
    // asociados a la categoría renombrada.

    const productos =
        obtenerProductos();

    const productosActualizados =
        productos.map((producto) => {

            if (
                producto.categoria !==
                nombreAnterior
            ) {
                return producto;
            }

            return {
                ...producto,
                categoria: nombreLimpio
            };
        });

    guardarProductos(
        productosActualizados
    );

    return {
        exito: true
    };
}


export function eliminarCategoria(id) {

    const categorias =
        obtenerCategorias();

    const categoria =
        categorias.find(
            (item) =>
                item.id === Number(id)
        );

    if (!categoria) {

        return {
            exito: false,
            mensaje: 'Categoría no encontrada.'
        };
    }

    const productos =
        obtenerProductos();

    const tieneProductos =
        productos.some(
            (producto) =>
                producto.categoria ===
                categoria.nombre
        );

    if (tieneProductos) {

        return {
            exito: false,
            mensaje:
                'No se puede eliminar la categoría porque tiene productos asociados.'
        };
    }

    const categoriasActualizadas =
        categorias.filter(
            (item) =>
                item.id !== Number(id)
        );

    localStorage.setItem(
        CLAVE_CATEGORIAS,
        JSON.stringify(
            categoriasActualizadas
        )
    );

    return {
        exito: true
    };
}