import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RutaConectada from '../components/RutaConectada.jsx';
import SesionConectadaProvider from '../context/SesionConectadaProvider.jsx';
import { CLAVE_SESION_CONECTADA } from '../context/sesionConectada.js';
import { RUTA_ADMIN_CONECTADA, RUTA_LOGIN_CONECTADO } from '../context/catalogo.js';
import AdminCategorias from '../pages/AdminCategorias.jsx';
import AdminPanel from '../pages/AdminPanel.jsx';
import AdminProductoEditar from '../pages/AdminProductoEditar.jsx';
import AdminProductoNuevo from '../pages/AdminProductoNuevo.jsx';
import AdminProductos from '../pages/AdminProductos.jsx';
import { adminCatalogoApi, crearAdminCatalogoApi } from '../services/adminCatalogoApi.js';

const id = (sufijo) => sufijo.padStart(24, '0');
const categoria = { id: id('c1'), nombre: 'TEST-Categoría' };
const categoriaOriginal = { id: id('c2'), nombre: 'Accesorios' };
const producto = { id: id('a1'), codigo: 'TEST-ACE', nombre: 'Aceite temporal', descripcion: 'Descripción temporal',
    categoriaId: categoria.id, categoria: categoria.nombre, precio: 5000, descuento: 10, precioFinal: 4500,
    stock: 2, stockCritico: 2, imagen: '/images/prueba.png' };
const productoOriginal = { ...producto, id: id('a2'), codigo: 'ACE001', nombre: 'Aceite original',
    categoriaId: categoriaOriginal.id, categoria: categoriaOriginal.nombre };
const tokenSimulado = 'token-simulado';
const rutaProductos = `${RUTA_ADMIN_CONECTADA}/productos`;
const rutaCategorias = `${RUTA_ADMIN_CONECTADA}/categorias`;
const apiPrueba = crearAdminCatalogoApi({
    habilitada: true, productos: [producto.id, productoOriginal.id], categorias: [categoria.id, categoriaOriginal.id]
});
const json = (datos, status = 200) => Response.json(datos, { status });

function apiSimulada({ productos = [producto, productoOriginal], categorias = [categoria, categoriaOriginal], responder } = {}) {
    const catalogo = { productos: [...productos], categorias: [...categorias] };
    return spyOn(window, 'fetch').and.callFake(async (url, opciones) => {
        const [, recurso, clave] = /^\/api\/v1\/(productos|categorias)(?:\/([^/]+))?$/.exec(url) ?? [];
        if (!recurso) throw new Error('Ruta inesperada en el catálogo simulado.');
        const { method } = opciones;
        const respuesta = responder?.({ recurso, clave, method, catalogo, opciones });
        if (respuesta) return respuesta;

        const datos = catalogo[recurso];
        const actual = datos.find((entidad) => entidad.id === clave);
        if (method === 'GET') return clave ? (actual ? json(actual) : json({}, 404)) : json(datos);
        if (method === 'DELETE') {
            catalogo[recurso] = datos.filter((entidad) => entidad.id !== clave);
            return new Response(null, { status: 204 });
        }
        const entrada = JSON.parse(opciones.body);
        const guardado = { ...actual, ...entrada, id: clave ?? id('b1') };
        if (recurso === 'productos') {
            guardado.categoria = catalogo.categorias.find((item) => item.id === guardado.categoriaId)?.nombre;
            guardado.precioFinal = Math.round(guardado.precio * (1 - guardado.descuento / 100));
        }
        catalogo[recurso] = [...datos.filter((entidad) => entidad.id !== guardado.id), guardado];
        return json(guardado, method === 'POST' ? 201 : 200);
    });
}

function montar(ruta, { cliente = apiPrueba, rol = 'ADMIN' } = {}) {
    if (rol) sessionStorage.setItem(CLAVE_SESION_CONECTADA, JSON.stringify({ token: tokenSimulado, expiraEn: Date.now() + 60000 }));
    const api = { consultarIdentidad: async () => ({ id: id('d1'), nombre: 'Usuario de prueba', correo: 'prueba@example.test', rol }) };
    return render(<MemoryRouter initialEntries={[ruta]}>
        <SesionConectadaProvider api={api}>
            <Routes>
                <Route path={RUTA_LOGIN_CONECTADO} element={<h1>Login conectado</h1>} />
                <Route element={<RutaConectada roles={['ADMIN']} porUsuario />}>
                    <Route path={RUTA_ADMIN_CONECTADA} element={<AdminPanel conectado />} />
                    <Route path={rutaProductos} element={<AdminProductos conectado cliente={cliente} />} />
                    <Route path={`${rutaProductos}/nuevo`} element={<AdminProductoNuevo conectado cliente={cliente} />} />
                    <Route path={`${rutaProductos}/editar/:id`} element={<AdminProductoEditar conectado cliente={cliente} />} />
                    <Route path={rutaCategorias} element={<AdminCategorias conectado cliente={cliente} />} />
                </Route>
                <Route path="/admin/productos" element={<AdminProductos />} />
                <Route path="/admin/productos/nuevo" element={<AdminProductoNuevo />} />
                <Route path="/admin/categorias" element={<AdminCategorias />} />
            </Routes>
        </SesionConectadaProvider>
    </MemoryRouter>);
}

function escribir(campos) {
    for (const [campo, value] of Object.entries(campos)) {
        fireEvent.change(screen.getByLabelText(campo, { exact: true }), { target: { value } });
    }
}

function escrituras(peticiones) {
    return peticiones.calls.allArgs().filter(([, opciones]) => opciones.method !== 'GET');
}

describe('Administración del catálogo conectado', () => {
    beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
    afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });

    it('consulta el listado sin datos locales ni JWT, muestra descuentos y filtra por categoría', async () => {
        localStorage.setItem('productosAutoCare', JSON.stringify([{ ...producto, nombre: 'Solo local' }]));
        const peticiones = apiSimulada();
        montar(rutaProductos);
        expect(await screen.findByText(producto.nombre)).toBeTruthy();
        expect(within(screen.getByText(producto.nombre).closest('tr')).getByText('10% · $4.500')).toBeTruthy();
        expect(screen.queryByText('Solo local')).toBeNull();
        expect(peticiones).toHaveBeenCalledOnceWith('/api/v1/productos', jasmine.objectContaining({
            method: 'GET', cache: 'no-store', headers: { Accept: 'application/json, application/problem+json' }
        }));
        escribir({ 'Filtrar por categoría': categoriaOriginal.id });
        expect(screen.queryByText(producto.nombre)).toBeNull();
        expect(await screen.findByText(productoOriginal.nombre)).toBeTruthy();
        escribir({ 'Buscar producto': 'sin coincidencias' });
        expect(screen.getByText(/No hay productos/)).toBeTruthy();
    });

    it('consulta categorías y muestra sus productos según el ObjectId', async () => {
        localStorage.setItem('categoriasAutoCare', '[{"id":1,"nombre":"Solo local"}]');
        const peticiones = apiSimulada();
        montar(rutaCategorias);
        expect(await screen.findByText(categoria.nombre)).toBeTruthy();
        expect(screen.queryByText('Solo local')).toBeNull();
        const fila = screen.getByText(categoria.nombre).closest('tr');
        expect(within(fila).getByText('1 producto')).toBeTruthy();
        expect(within(fila).getByText(producto.nombre)).toBeTruthy();
        expect(peticiones).toHaveBeenCalledWith('/api/v1/categorias', jasmine.objectContaining({ method: 'GET' }));
    });

    it('muestra conteos remotos y marca las demás tarjetas como locales', async () => {
        apiSimulada({ productos: [producto], categorias: [categoria, categoriaOriginal] });
        montar(RUTA_ADMIN_CONECTADA);
        await screen.findByRole('heading', { name: 'Panel de Administración' });
        const tarjeta = (nombre) => screen.getByRole('heading', { name: nombre }).closest('.card');
        await within(tarjeta('Productos')).findByText('1');
        expect(within(tarjeta('Categorías')).getByText('2')).toBeTruthy();
        expect(screen.getAllByText('· Simulación local').length).toBe(5);
    });

    it('muestra errores de lectura, permite reintentar y conserva el origen remoto', async () => {
        let disponible = false;
        apiSimulada({ responder: () => disponible ? undefined : json({ detail: 'Detalle interno' }, 500) });
        montar(rutaProductos);
        expect((await screen.findByRole('alert')).textContent).toContain('No se pudo completar');
        expect(screen.queryByText('Detalle interno')).toBeNull();
        disponible = true;
        fireEvent.click(screen.getByRole('button', { name: 'Volver a consultar' }));
        expect(await screen.findByText(producto.nombre)).toBeTruthy();
    });

    it('crea un producto con el DTO exacto, JWT y listado actualizado', async () => {
        const peticiones = apiSimulada();
        montar(`${rutaProductos}/nuevo`);
        await screen.findByLabelText('Código');
        escribir({ Código: ' TEST-NUEVO ', Nombre: ' Producto nuevo ', Descripción: 'Detalle', Precio: '7500',
            'Descuento (%)': '25', Stock: '5', 'Stock crítico': '1', Categoría: categoria.id });
        fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
        expect(await screen.findByText('Producto nuevo')).toBeTruthy();
        expect(screen.getByText('Producto creado.')).toBeTruthy();
        const [[url, solicitud]] = escrituras(peticiones);
        expect(url).toBe('/api/v1/productos');
        expect(solicitud.headers.Authorization).toBe(`Bearer ${tokenSimulado}`);
        expect(JSON.parse(solicitud.body)).toEqual({ codigo: 'TEST-NUEVO', nombre: 'Producto nuevo', descripcion: 'Detalle',
            precio: 7500, descuento: 25, stock: 5, stockCritico: 1, categoriaId: categoria.id, imagen: '/images/Tienda.png' });
        expect(localStorage.getItem('productosAutoCare')).toBeNull();
    });

    it('edita con los datos del detalle, conserva el descuento y obtiene el listado actualizado', async () => {
        localStorage.setItem('productosAutoCare', '[{"nombre":"Detalle desactualizado"}]');
        const peticiones = apiSimulada();
        montar(`${rutaProductos}/editar/${producto.id}`);
        expect((await screen.findByLabelText('Nombre')).value).toBe(producto.nombre);
        expect(screen.getByLabelText('Descuento (%)').value).toBe('10');
        escribir({ Nombre: 'Aceite actualizado', Precio: '6000.5' });
        fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
        expect(await screen.findByText('Aceite actualizado')).toBeTruthy();
        const [[url, solicitud]] = escrituras(peticiones);
        expect(url).toBe(`/api/v1/productos/${producto.id}`);
        expect(solicitud.method).toBe('PUT');
        expect(JSON.parse(solicitud.body)).toEqual(jasmine.objectContaining({ precio: 6000.5, descuento: 10, stock: 2 }));
        expect(localStorage.getItem('productosAutoCare')).toBe('[{"nombre":"Detalle desactualizado"}]');
    });

    it('conserva el formulario y bloquea una edición si el registro cambió en el servidor', async () => {
        let actualizar = false;
        const peticiones = apiSimulada({ responder: ({ recurso, clave, method }) =>
            actualizar && recurso === 'productos' && clave === producto.id && method === 'GET'
                ? json({ ...producto, stock: 1 }) : undefined });
        montar(`${rutaProductos}/editar/${producto.id}`);
        await screen.findByLabelText('Nombre');
        actualizar = true;
        escribir({ Nombre: 'Nombre que intenté guardar' });
        fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
        expect((await screen.findByRole('alert')).textContent).toContain('El registro cambió desde que lo abriste');
        expect(screen.getByLabelText('Nombre').value).toBe('Nombre que intenté guardar');
        expect(escrituras(peticiones)).toEqual([]);
    });

    it('valida código, nombre, precio, descuento, stock y categoría antes del POST', async () => {
        const peticiones = apiSimulada();
        montar(`${rutaProductos}/nuevo`);
        await screen.findByLabelText('Código');
        escribir({ Código: 'A', Nombre: ' ', Precio: '-1', 'Descuento (%)': '101', Stock: '1.5' });
        fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
        const error = await screen.findByRole('alert');
        for (const campo of ['Código', 'Nombre', 'Precio', 'Descuento (%)', 'Stock', 'Categoría']) {
            expect(error.textContent).toContain(campo);
        }
        expect(escrituras(peticiones)).toEqual([]);
    });

    it('muestra los mensajes por campo de Spring Boot y conserva lo ingresado', async () => {
        apiSimulada({ responder: ({ method }) => method === 'POST'
            ? json({ detail: 'Revisa los campos indicados.', campos: { stock: 'Stock rechazado por el servidor.' } }, 400)
            : undefined });
        montar(`${rutaProductos}/nuevo`);
        await screen.findByLabelText('Código');
        escribir({ Código: 'TEST-X', Nombre: 'Temporal', Precio: '5', Stock: '2', Categoría: categoria.id });
        fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
        expect((await screen.findByRole('alert')).textContent).toContain('Stock rechazado por el servidor.');
        expect(screen.getByLabelText('Código').value).toBe('TEST-X');
    });

    it('pide confirmación al eliminar y recarga tras un DELETE 204', async () => {
        const peticiones = apiSimulada();
        const confirmar = spyOn(window, 'confirm').and.returnValues(false, true);
        montar(rutaProductos);
        const fila = (await screen.findByText(producto.nombre)).closest('tr');
        const eliminar = within(fila).getByRole('button', { name: 'Eliminar' });
        fireEvent.click(eliminar);
        expect(escrituras(peticiones)).toEqual([]);
        fireEvent.click(eliminar);
        expect(await screen.findByText('Producto eliminado.')).toBeTruthy();
        await waitFor(() => {
            if (screen.queryByText(producto.nombre)) throw new Error('El listado aún muestra el producto borrado.');
        });
        expect(await screen.findByText(productoOriginal.nombre)).toBeTruthy();
        expect(confirmar.calls.count()).toBe(2);
        expect(escrituras(peticiones)).toEqual([[
            `/api/v1/productos/${producto.id}`, jasmine.objectContaining({
                method: 'DELETE', headers: jasmine.objectContaining({ Authorization: `Bearer ${tokenSimulado}` })
            })
        ]]);
        expect(escrituras(peticiones)[0][1].body).toBeUndefined();
    });

    it('crea, edita y elimina categorías temporales con el formulario existente', async () => {
        const peticiones = apiSimulada();
        spyOn(window, 'confirm').and.returnValue(true);
        montar(rutaCategorias);
        await screen.findByText(categoria.nombre);
        escribir({ Nombre: ' TEST-Nueva ' });
        fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }));
        expect(await screen.findByText('TEST-Nueva')).toBeTruthy();
        fireEvent.click(within(screen.getByText(categoria.nombre).closest('tr')).getByRole('button', { name: 'Editar' }));
        expect(screen.getByLabelText('Nombre').value).toBe(categoria.nombre);
        escribir({ Nombre: 'TEST-Renombrada' });
        fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
        const fila = (await screen.findByText('TEST-Renombrada')).closest('tr');
        fireEvent.click(within(fila).getByRole('button', { name: 'Eliminar' }));
        expect(await screen.findByText('Categoría eliminada correctamente.')).toBeTruthy();
        const acciones = escrituras(peticiones);
        expect(acciones.map(([url, opciones]) => [url, opciones.method, opciones.headers.Authorization])).toEqual([
            ['/api/v1/categorias', 'POST', `Bearer ${tokenSimulado}`],
            [`/api/v1/categorias/${categoria.id}`, 'PUT', `Bearer ${tokenSimulado}`],
            [`/api/v1/categorias/${categoria.id}`, 'DELETE', `Bearer ${tokenSimulado}`]
        ]);
        expect(JSON.parse(acciones[0][1].body)).toEqual({ nombre: 'TEST-Nueva' });
        expect(JSON.parse(acciones[1][1].body)).toEqual({ nombre: 'TEST-Renombrada' });
        expect(screen.queryByText('TEST-Renombrada')).toBeNull();
    });

    it('muestra el 409 de una categoría con productos y conserva el listado', async () => {
        apiSimulada({ responder: ({ method }) => method === 'DELETE'
            ? json({ detail: 'La categoría tiene productos asociados.' }, 409) : undefined });
        spyOn(window, 'confirm').and.returnValue(true);
        montar(rutaCategorias);
        const fila = (await screen.findByText(categoria.nombre)).closest('tr');
        fireEvent.click(within(fila).getByRole('button', { name: 'Eliminar' }));
        expect((await screen.findByRole('alert')).textContent).toContain('La categoría tiene productos asociados.');
        expect(screen.getByText(categoria.nombre)).toBeTruthy();
    });

    for (const [estado, mensaje] of [[403, 'Tu cuenta no tiene permiso'], [404, 'El registro ya no existe'], [500, 'No se pudo completar']]) {
        it(`informa un ${estado} y conserva el listado`, async () => {
            apiSimulada({ responder: ({ method }) => method === 'DELETE' ? json({}, estado) : undefined });
            spyOn(window, 'confirm').and.returnValue(true);
            montar(rutaProductos);
            const fila = (await screen.findByText(producto.nombre)).closest('tr');
            fireEvent.click(within(fila).getByRole('button', { name: 'Eliminar' }));
            expect((await screen.findByRole('alert')).textContent).toContain(mensaje);
            expect(screen.getByText(producto.nombre)).toBeTruthy();
        });
    }

    it('cierra la sesión conectada ante 401 en una escritura', async () => {
        apiSimulada({ responder: ({ method }) => method === 'DELETE' ? json({}, 401) : undefined });
        spyOn(window, 'confirm').and.returnValue(true);
        montar(rutaProductos);
        const fila = (await screen.findByText(producto.nombre)).closest('tr');
        fireEvent.click(within(fila).getByRole('button', { name: 'Eliminar' }));
        expect(await screen.findByRole('heading', { name: 'Login conectado' })).toBeTruthy();
        expect(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).toBeNull();
    });

    for (const rol of ['VENDEDOR', 'CLIENTE']) {
        it(`protege la ruta administrativa del rol ${rol} sin reutilizar el rol local`, async () => {
            localStorage.setItem('sesionAutoCare', '{"rol":"admin"}');
            const peticiones = apiSimulada();
            montar(rutaCategorias, { rol });
            expect((await screen.findByRole('alert')).textContent).toContain('Tu rol no tiene permiso');
            expect(screen.queryByRole('button', { name: 'Crear categoría' })).toBeNull();
            expect(peticiones).not.toHaveBeenCalled();
        });
    }

    it('redirige al login conectado a un visitante anónimo', async () => {
        const peticiones = apiSimulada();
        montar(rutaProductos, { rol: null });
        expect(await screen.findByRole('heading', { name: 'Login conectado' })).toBeTruthy();
        expect(peticiones).not.toHaveBeenCalled();
    });

    it('deshabilita las escrituras por defecto en la interfaz y el cliente REST', async () => {
        const peticiones = apiSimulada();
        montar(rutaProductos, { cliente: adminCatalogoApi });
        await screen.findByText(producto.nombre);
        expect(screen.getByRole('button', { name: 'Nuevo producto' }).disabled).toBeTrue();
        expect(screen.getAllByRole('button', { name: 'Eliminar' }).every((boton) => boton.disabled)).toBeTrue();
        await expectAsync(adminCatalogoApi.guardarCategoria(undefined, { nombre: categoria.nombre }, () => tokenSimulado))
            .toBeRejectedWithError(/deshabilitadas/);
        await expectAsync(adminCatalogoApi.eliminarProducto(producto.id, () => tokenSimulado)).toBeRejectedWithError(/deshabilitadas/);
        expect(escrituras(peticiones)).toEqual([]);
    });

    it('bloquea IDs fuera de la lista, registros originales y renombres sin prefijo', async () => {
        const peticiones = apiSimulada();
        const token = () => tokenSimulado;
        await expectAsync(apiPrueba.eliminarProducto(id('ae'), token)).toBeRejectedWithError(/lista de registros temporales/);
        await expectAsync(apiPrueba.eliminarProducto(productoOriginal.id, token)).toBeRejectedWithError(/ya no cumple/);
        await expectAsync(apiPrueba.eliminarCategoria(categoriaOriginal.id, token)).toBeRejectedWithError(/ya no cumple/);
        await expectAsync(apiPrueba.guardarCategoria(categoria.id, { nombre: 'Nombre original' }, token))
            .toBeRejectedWithError(/debe empezar con TEST-/);
        await expectAsync(apiPrueba.guardarProducto(undefined, { codigo: 'TEST-NUEVO', categoriaId: categoriaOriginal.id }, token))
            .toBeRejectedWithError(/categoría temporal/);
        expect(escrituras(peticiones)).toEqual([]);
    });

    it('bloquea renombrar una categoría temporal si tiene un producto original asociado', async () => {
        const peticiones = apiSimulada({ productos: [{ ...productoOriginal, categoriaId: categoria.id }] });
        await expectAsync(apiPrueba.guardarCategoria(categoria.id, { nombre: 'TEST-Renombrada' }, () => tokenSimulado))
            .toBeRejectedWithError(/asociada a productos que no son temporales/);
        expect(escrituras(peticiones)).toEqual([]);
    });

    it('conserva la creación local independiente de JWT, de la API y del bloqueo conectado', async () => {
        const peticiones = spyOn(window, 'fetch');
        montar('/admin/productos/nuevo', { rol: null });
        escribir({ Código: 'LOCAL-EV3', Nombre: 'Producto simulado', Precio: '3500', Stock: '2', Categoría: 'Accesorios' });
        fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
        expect(await screen.findByText('Producto simulado')).toBeTruthy();
        expect(JSON.parse(localStorage.getItem('productosAutoCare')).some((item) => item.codigo === 'LOCAL-EV3')).toBeTrue();
        expect(peticiones).not.toHaveBeenCalled();
    });
});
