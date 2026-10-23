const CLAVE_PRODUCTOS = 'productosAutoCare';

export const productosIniciales = [
    {
        id: 1,
        codigo: 'ACE001',
        nombre: 'Aceite Sintético 5W-30',
        descripcion: 'Aceite sintético para mantenimiento preventivo.',
        precio: 35000,
        stock: 24,
        stockCritico: 5,
        categoria: 'Aceites y Filtros',
        imagen: '/images/Aceite.png'
    },
    {
        id: 2,
        codigo: 'DET001',
        nombre: 'Kit Detailing Básico',
        descripcion: 'Kit básico para limpieza y cuidado automotriz.',
        precio: 25000,
        stock: 15,
        stockCritico: 4,
        categoria: 'Detailing y Limpieza',
        imagen: '/images/Kit.png'
    },
    {
        id: 3,
        codigo: 'AMP001',
        nombre: 'Ampolleta H7 LED',
        descripcion: 'Ampolleta LED H7 para iluminación automotriz.',
        precio: 15000,
        stock: 30,
        stockCritico: 6,
        categoria: 'Ampolletas y Electricidad',
        imagen: '/images/ampolleta.png'
    },
    {
        id: 4,
        codigo: 'FIL001',
        nombre: 'Filtro de Aire Premium',
        descripcion: 'Filtro de aire de alto rendimiento.',
        precio: 12000,
        stock: 12,
        stockCritico: 3,
        categoria: 'Aceites y Filtros',
        imagen: '/images/filtro.png'
    }
];

export function obtenerProductos() {
    const guardados = localStorage.getItem(CLAVE_PRODUCTOS);

    if (guardados) {
        return JSON.parse(guardados);
    }

    localStorage.setItem(
        CLAVE_PRODUCTOS,
        JSON.stringify(productosIniciales)
    );

    return [...productosIniciales];
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
        id: Date.now()
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
        producto.id === id
            ? { ...producto, ...datosActualizados }
            : producto
    );

    guardarProductos(productosActualizados);

    return productosActualizados;
}

export function eliminarProducto(id) {
    const productos = obtenerProductos();

    const productosActualizados = productos.filter(
        (producto) => producto.id !== id
    );

    guardarProductos(productosActualizados);

    return productosActualizados;
}