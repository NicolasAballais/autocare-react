import productosIniciales from '../data/productos.json';

const CLAVE_PRODUCTOS = 'productosAutoCare';

function normalizarProductos(productos) {
    return productos.map((producto) => {
        const productoBase = productosIniciales.find(
            (item) => Number(item.id) === Number(producto.id)
        );

        return {
            ...productoBase,
            ...producto,
            descuento:
                producto.descuento ??
                productoBase?.descuento ??
                0
        };
    });
}

export function obtenerProductos() {
    const guardados = localStorage.getItem(CLAVE_PRODUCTOS);

    if (guardados) {
        const productos = normalizarProductos(JSON.parse(guardados));

        localStorage.setItem(
            CLAVE_PRODUCTOS,
            JSON.stringify(productos)
        );

        return productos;
    }

    const productos = productosIniciales.map((producto) => ({ ...producto }));

    localStorage.setItem(
        CLAVE_PRODUCTOS,
        JSON.stringify(productos)
    );

    return productos;
}

export function guardarProductos(productos) {
    localStorage.setItem(
        CLAVE_PRODUCTOS,
        JSON.stringify(productos)
    );
}

export function crearProducto(producto) {
    const productos = obtenerProductos();

    const nuevoProducto = {
        ...producto,
        id: Date.now(),
        descuento: Number(producto.descuento ?? 0)
    };

    const productosActualizados = [
        ...productos,
        nuevoProducto
    ];

    guardarProductos(productosActualizados);

    return nuevoProducto;
}

export function actualizarProducto(id, datosActualizados) {
    const productos = obtenerProductos();

    const productosActualizados = productos.map((producto) =>
        Number(producto.id) === Number(id)
            ? { ...producto, ...datosActualizados }
            : producto
    );

    guardarProductos(productosActualizados);

    return productosActualizados;
}

export function eliminarProducto(id) {
    const productos = obtenerProductos();

    const productosActualizados = productos.filter(
        (producto) => Number(producto.id) !== Number(id)
    );

    guardarProductos(productosActualizados);

    return productosActualizados;
}

export function obtenerDescuentoProducto(producto) {
    return Number(producto?.descuento ?? 0);
}

export function obtenerPrecioFinalProducto(producto) {
    const descuento = obtenerDescuentoProducto(producto);

    if (descuento <= 0) {
        return Number(producto.precio);
    }

    return Math.round(
        Number(producto.precio) *
        (1 - descuento / 100)
    );
}

export function productoEstaEnOferta(producto) {
    return obtenerDescuentoProducto(producto) > 0;
}
