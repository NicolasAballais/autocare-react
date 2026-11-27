import { expect, test as base } from '@playwright/test';
import { ACEITE, CLAVE_FICTICIA, CUENTAS, ENTREGA, FECHA, FILTRO, IDS, RUTAS } from './datos.js';

const tokenDe = (cuenta) => 'token-simulado-' + cuenta.id;
const ok = (json, status = 200) => ({ status, json });
const problema = (status, detail) => ok({ detail, status }, status);
const vacia = { status: 204 };

function detalle(producto, cantidad) {
    return {
        productoId: producto.id, nombre: producto.nombre, codigo: producto.codigo, cantidad,
        precioOriginal: producto.precio, descuento: producto.descuento,
        precioUnitario: producto.precioFinal, subtotal: producto.precioFinal * cantidad
    };
}

function crearDatos() {
    const categorias = [{ id: IDS.aceites, nombre: 'TEST-Aceites' }, { id: IDS.filtros, nombre: 'Filtros' }];
    const productos = [
        { id: IDS.aceite, codigo: 'TEST-ACE-01', nombre: ACEITE, descripcion: 'Aceite sintético para motor',
            precio: 10000, descuento: 10, precioFinal: 9000, stock: 4, stockCritico: 2, imagen: '/images/Aceite.png',
            categoriaId: IDS.aceites, categoria: 'TEST-Aceites' },
        { id: IDS.filtro, codigo: 'TEST-FIL-01', nombre: FILTRO, descripcion: 'Filtro para la mantención',
            precio: 5000, descuento: 0, precioFinal: 5000, stock: 1, stockCritico: 1, imagen: '/images/filtro.png',
            categoriaId: IDS.filtros, categoria: 'Filtros' }
    ];
    const orden = { id: IDS.orden, compradorId: IDS.cliente, fechaCreacion: FECHA, estado: 'PROCESANDO',
        entrega: { ...ENTREGA }, productos: [detalle(productos[0], 1)], total: 9000 };
    const ordenAjena = { ...orden, id: IDS.ordenAjena, compradorId: IDS.otraCuenta, estado: 'ENVIADO',
        entrega: { ...ENTREGA, nombre: 'Titular diferente' } };
    return {
        categorias, productos, ordenes: [orden, ordenAjena],
        cuentas: Object.values(CUENTAS).map((cuenta) => ({ ...cuenta })),
        clientes: [{ ...CUENTAS.CLIENTE, nombre: 'Camila', apellido: 'Demo', telefono: ENTREGA.telefono,
            comuna: ENTREGA.comuna, direccion: ENTREGA.direccion }],
        incidencias: [{ id: IDS.incidencia, compradorId: IDS.cliente, ordenId: IDS.orden,
            asunto: 'Seguimiento inicial', descripcion: 'Consulta de despacho', fecha: FECHA, estado: 'PENDIENTE' }],
        mensajes: [], compras: [], claves: new Map(), fallarPrimeraCompra: false, stockInsuficiente: false
    };
}

function resumenOrden({ compradorId, entrega, ...orden }, conEntrega = false) {
    return conEntrega ? { ...orden, entrega } : orden;
}

function catalogo(datos, recurso, id, metodo, cuerpo) {
    const lista = datos[recurso];
    const registro = lista.find((entrada) => entrada.id === id);
    if (metodo === 'GET') return id ? (registro ? ok(registro) : problema(404, 'Registro no encontrado.')) : ok(lista);
    if (id && !registro) return problema(404, 'Registro no encontrado.');
    if (metodo === 'DELETE') {
        if (recurso === 'categorias' && datos.productos.some((producto) => producto.categoriaId === id)) {
            return problema(409, 'La categoría tiene productos asociados.');
        }
        lista.splice(lista.indexOf(registro), 1);
        return vacia;
    }

    if (metodo !== 'POST' && metodo !== 'PUT') throw new Error('Método de catálogo inesperado');
    const guardado = { ...registro, ...cuerpo,
        id: id ?? (recurso === 'productos' ? IDS.productoNuevo : IDS.categoriaNueva) };
    if (recurso === 'productos') {
        const categoria = datos.categorias.find((entrada) => entrada.id === guardado.categoriaId);
        guardado.categoria = categoria?.nombre;
        guardado.precioFinal = Math.round(guardado.precio * (1 - guardado.descuento / 100));
    }
    if (registro) Object.assign(registro, guardado);
    else lista.push(guardado);
    if (recurso === 'categorias') {
        datos.productos.filter((producto) => producto.categoriaId === guardado.id)
            .forEach((producto) => { producto.categoria = guardado.nombre; });
    }
    return ok(guardado, metodo === 'POST' ? 201 : 200);
}

function autenticar(datos, accion, metodo, cuenta, cuerpo) {
    if (accion === 'me' && metodo === 'GET') return cuenta ? ok(cuenta) : problema(401, 'Se requiere sesión.');
    if (metodo !== 'POST') throw new Error('Método de autenticación inesperado');
    if (accion === 'login') {
        const usuario = datos.cuentas.find((usuario) => usuario.correo === cuerpo.correo);
        return usuario && cuerpo.contrasena === CLAVE_FICTICIA ? ok({
            token: tokenDe(usuario), tipo: 'Bearer', expiraEnSegundos: 3600, usuario
        }) : problema(401, 'Credenciales inválidas.');
    }
    if (accion !== 'registro') throw new Error('Acción de autenticación inesperada');
    if (datos.cuentas.some((usuario) => usuario.correo === cuerpo.correo)) return problema(409, 'Correo duplicado.');
    const usuario = { id: IDS.cuentaNueva, nombre: cuerpo.nombre, correo: cuerpo.correo, rol: 'CLIENTE' };
    datos.cuentas.push(usuario);
    return ok(usuario, 201);
}

function ordenes(datos, id, accion, metodo, cuenta, cuerpo, headers) {
    if (metodo === 'POST' && !id) {
        if (cuenta.rol === 'VENDEDOR') return problema(403, 'Compra prohibida.');
        const clave = headers['idempotency-key'];
        datos.compras.push({ clave, cuerpo });
        if (!clave) return problema(400, 'Falta Idempotency-Key.');
        const intento = datos.claves.get(clave);
        if (intento) {
            return JSON.stringify(cuerpo) === JSON.stringify(intento.cuerpo) && cuenta.id === intento.orden.compradorId
                ? ok(resumenOrden(intento.orden), 201) : problema(409, 'La compra cambió.');
        }
        if (datos.fallarPrimeraCompra && datos.compras.length === 1) return problema(503, 'Resultado sin confirmar.');
        const lineas = cuerpo.productos.map(({ productoId, cantidad }) =>
            ({ producto: datos.productos.find((entrada) => entrada.id === productoId), cantidad }));
        if (datos.stockInsuficiente || lineas.some(({ producto, cantidad }) => !producto || cantidad > producto.stock)) {
            return problema(409, 'Stock insuficiente para la cantidad solicitada.');
        }
        const productos = lineas.map(({ producto, cantidad }) => detalle(producto, cantidad));
        const orden = { id: clave, compradorId: cuenta.id, fechaCreacion: FECHA, estado: 'PROCESANDO',
            productos, total: productos.reduce((total, linea) => total + linea.subtotal, 0), entrega: cuerpo.entrega };
        for (const { producto, cantidad } of lineas) producto.stock -= cantidad;
        datos.ordenes.unshift(orden);
        datos.claves.set(clave, { cuerpo, orden });
        return ok(resumenOrden(orden), 201);
    }
    if (metodo === 'PUT' && accion === 'envio') {
        if (cuenta.rol !== 'ADMIN') return problema(403, 'Despacho prohibido.');
        const orden = datos.ordenes.find((entrada) => entrada.id === id);
        if (!orden) return problema(404, 'Orden no encontrada.');
        orden.estado = 'ENVIADO';
        return vacia;
    }
    if (metodo !== 'GET' || accion) throw new Error('Operación de órdenes inesperada');
    const visibles = cuenta.rol === 'CLIENTE' ? datos.ordenes.filter((orden) => orden.compradorId === cuenta.id) : datos.ordenes;
    if (!id) return ok(visibles.map((orden) => resumenOrden(orden)));
    const orden = visibles.find((entrada) => entrada.id === id);
    return orden ? ok(resumenOrden(orden, cuenta.rol !== 'VENDEDOR')) : problema(404, 'Orden no encontrada.');
}

function clientes(datos, id, accion, metodo, cuenta, cuerpo) {
    if (id === 'me' && accion === 'perfil' && ['GET', 'PUT'].includes(metodo)) {
        if (cuenta.rol === 'VENDEDOR') return problema(403, 'Perfil prohibido.');
        const perfil = datos.clientes.find((cliente) => cliente.id === cuenta.id) ?? cuenta;
        if (metodo === 'GET') return ok(perfil);
        Object.assign(perfil, cuerpo);
        cuenta.nombre = [cuerpo.nombre, cuerpo.apellido].filter(Boolean).join(' ');
        cuenta.correo = cuerpo.correo;
        return ok(perfil);
    }
    if (cuenta.rol !== 'ADMIN') return problema(403, 'Administración prohibida.');
    if (metodo === 'POST' && !id) {
        const cliente = { ...cuerpo.datos, id: IDS.cuentaNueva, rol: 'CLIENTE' };
        datos.clientes.push(cliente);
        return ok(cliente, 201);
    }
    if (metodo === 'GET' && !id) return ok(datos.clientes);
    const cliente = datos.clientes.find((entrada) => entrada.id === id);
    if (!cliente) return problema(404, 'Cliente no encontrado.');
    if (metodo === 'GET' && accion === 'ordenes') return ok(datos.ordenes.filter((orden) => orden.compradorId === id)
        .map((orden) => resumenOrden(orden)));
    if (metodo === 'GET' && !accion) return ok(cliente);
    if (metodo === 'PUT' && !accion) return ok(Object.assign(cliente, cuerpo));
    throw new Error('Operación de clientes inesperada');
}

function incidencias(datos, id, accion, metodo, cuenta, cuerpo) {
    if (cuenta.rol === 'VENDEDOR') return problema(403, 'Incidencias prohibidas.');
    if (metodo === 'GET' && !id) return ok(datos.incidencias.filter((incidencia) =>
        cuenta.rol === 'ADMIN' || incidencia.compradorId === cuenta.id));
    if (metodo === 'POST' && !id && cuenta.rol === 'CLIENTE') {
        if (!datos.ordenes.some((orden) => orden.id === cuerpo.ordenId && orden.compradorId === cuenta.id)) {
            return problema(404, 'Orden no encontrada.');
        }
        const incidencia = { ...cuerpo, id: IDS.incidenciaNueva, fecha: FECHA, estado: 'PENDIENTE', compradorId: cuenta.id };
        datos.incidencias.push(incidencia);
        return ok(incidencia, 201);
    }
    if (metodo === 'PUT' && accion === 'resolucion' && cuenta.rol === 'ADMIN') {
        const incidencia = datos.incidencias.find((entrada) => entrada.id === id);
        if (!incidencia) return problema(404, 'Incidencia no encontrada.');
        incidencia.estado = 'RESUELTA';
        return vacia;
    }
    return problema(403, 'Acción prohibida.');
}

function responder(datos, ruta, peticion) {
    const [recurso, id, accion] = ruta.slice('/api/v1/'.length).split('/');
    const metodo = peticion.method();
    const headers = peticion.headers();
    const cuenta = datos.cuentas.find((usuario) => headers.authorization === 'Bearer ' + tokenDe(usuario));
    const cuerpo = peticion.postData() ? peticion.postDataJSON() : null;
    if (recurso === 'auth') return autenticar(datos, id, metodo, cuenta, cuerpo);
    if (['productos', 'categorias'].includes(recurso)) {
        if (metodo === 'GET' || cuenta?.rol === 'ADMIN') return catalogo(datos, recurso, id, metodo, cuerpo);
        return problema(cuenta ? 403 : 401, 'Acceso de catálogo restringido.');
    }
    if (!['ordenes', 'usuarios', 'incidencias', 'contacto'].includes(recurso)) throw new Error('Ruta de API inesperada');
    if (!cuenta) return problema(401, 'Se requiere sesión.');
    if (recurso === 'ordenes') return ordenes(datos, id, accion, metodo, cuenta, cuerpo, headers);
    if (recurso === 'usuarios') return clientes(datos, id, accion, metodo, cuenta, cuerpo);
    if (recurso === 'incidencias') return incidencias(datos, id, accion, metodo, cuenta, cuerpo);
    if (recurso === 'contacto' && metodo === 'POST') {
        if (cuenta.rol === 'VENDEDOR') return problema(403, 'Contacto prohibido.');
        datos.mensajes.push(cuerpo);
        return vacia;
    }
    throw new Error('Ruta de API inesperada');
}

export const test = base.extend({
    api: [async ({ context, baseURL, page }, usar) => {
        const datos = crearDatos();
        const errores = [];
        page.on('pageerror', (error) => errores.push(error.message));
        await context.route('**/*', async (route) => {
            const peticion = route.request();
            const url = new URL(peticion.url());
            if (url.origin !== baseURL) return route.abort();
            if (!url.pathname.startsWith('/api/')) return route.continue();

            try {
                if (!url.pathname.startsWith('/api/v1/')) throw new Error('Versión de API inesperada');
                return await route.fulfill(responder(datos, url.pathname, peticion));
            } catch (error) {
                errores.push(peticion.method() + ' ' + url.pathname + ' · ' + error.message);
                return route.fulfill(problema(500, 'Falta configurar esta solicitud simulada.'));
            }
        });
        await usar(datos);
        expect(errores, 'Errores de JavaScript o solicitudes sin simulación').toEqual([]);
    }, { auto: true }]
});

export { expect };

export async function iniciarSesion(page, rol) {
    await page.goto(RUTAS.login);
    await page.getByLabel('Correo electrónico').fill(CUENTAS[rol].correo);
    await page.getByLabel('Contraseña', { exact: true }).fill(CLAVE_FICTICIA);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
}

export async function capturar(page, testInfo, nombre) {
    await testInfo.attach(nombre, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
}
