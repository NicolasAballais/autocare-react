export const RUTAS = {
    catalogo: '/catalogo-conectado',
    admin: '/catalogo-conectado/admin',
    login: '/catalogo-conectado/login',
    registro: '/catalogo-conectado/registro',
    ordenes: '/catalogo-conectado/ordenes',
    incidencias: '/catalogo-conectado/incidencias',
    carrito: '/catalogo-conectado/carrito'
};

export const IDS = {
    admin: '640000000000000000000001',
    cliente: '640000000000000000000002',
    vendedor: '640000000000000000000003',
    otraCuenta: '640000000000000000000004',
    cuentaNueva: '640000000000000000000005',
    aceites: '650000000000000000000001',
    filtros: '650000000000000000000002',
    categoriaNueva: '650000000000000000000003',
    aceite: '660000000000000000000001',
    filtro: '660000000000000000000002',
    productoNuevo: '660000000000000000000003',
    orden: '670000000000000000000001',
    ordenAjena: '670000000000000000000002',
    incidencia: '680000000000000000000001',
    incidenciaNueva: '680000000000000000000002'
};

export const CLAVE_FICTICIA = 'ClavePrueba-EV3-123';
export const CUENTAS = {
    ADMIN: { id: IDS.admin, nombre: 'Administradora Demo', correo: 'admin@example.test', rol: 'ADMIN' },
    CLIENTE: { id: IDS.cliente, nombre: 'Camila Demo', correo: 'camila@example.test', rol: 'CLIENTE' },
    VENDEDOR: { id: IDS.vendedor, nombre: 'Vendedor Demo', correo: 'vendedor@example.test', rol: 'VENDEDOR' }
};

export const ENTREGA = {
    nombre: 'Camila Demo', correo: CUENTAS.CLIENTE.correo, telefono: '900000000',
    comuna: 'Santiago', direccion: 'Calle de prueba 123', tipo: 'Envío estándar'
};

export const FECHA = '2026-07-30T15:00:00Z';
export const ACEITE = 'Aceite de prueba';
export const FILTRO = 'Filtro de prueba';
