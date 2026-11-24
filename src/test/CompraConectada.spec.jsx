import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { RUTA_CARRITO_CONECTADO, RUTA_CHECKOUT_CONECTADO, RUTA_COMPRA_CONECTADA } from '../context/catalogo.js';
import { SesionConectadaContext } from '../context/sesionConectada.js';
import Carrito from '../pages/Carrito.jsx';
import Checkout from '../pages/Checkout.jsx';
import CompraConectada from '../pages/CompraConectada.jsx';
import RevisionCarritoConectado from '../pages/RevisionCarritoConectado.jsx';
import { lineaCarritoConectado } from '../services/carritoService.js';
import { crearEnvioOrden, enviarOrdenApi, generarClaveOrden } from '../services/ordenesApi.js';

const COMPRADOR = '6400000000000000000000a1';
const OTRO_COMPRADOR = '6400000000000000000000a2';
const TOKEN = 'token-simulado';
const CLAVE = `carritoConectadoAutoCare:${COMPRADOR}`;
const ID = '6600000000000000000000a1';
const ORDEN_ID = '6700000000000000000000a2';
const producto = { id: ID, codigo: 'TEST-ACE001', nombre: 'Aceite de prueba', precio: 35000,
    precioFinal: 28000, descuento: 20, stock: 3 };
const orden = (id, cantidad = 1) => ({ id, estado: 'PROCESANDO', total: 27500,
    productos: [{ productoId: ID, nombre: producto.nombre, cantidad }] });
const solicitud = { productos: [{ productoId: ID, cantidad: 1 }] };
const entrega = {
    pathname: RUTA_COMPRA_CONECTADA,
    state: { compradorId: COMPRADOR, datosCliente: { nombre: 'Cliente de prueba' }, tipoEntrega: 'Envío estándar' }
};

function guardarCarrito() {
    localStorage.setItem(CLAVE, JSON.stringify({ carrito: [lineaCarritoConectado(producto, 1)], intento: null }));
}

function simulacionApi({ productos = [producto], post, getOrden } = {}) {
    return spyOn(window, 'fetch').and.callFake(async (url, opciones) => {
        if (url === '/api/v1/productos' && opciones.method === 'GET') return Response.json(productos);
        if (url === '/api/v1/ordenes' && opciones.method === 'POST' && post) return post(opciones);
        if (url.startsWith('/api/v1/ordenes/') && opciones.method === 'GET') {
            return getOrden ? getOrden(url.split('/').at(-1)) : Response.json({}, { status: 404 });
        }
        throw new Error(`Solicitud no prevista: ${opciones.method} ${url}`);
    });
}

function renderizar(entrada, simularEnvio = false, comprador = COMPRADOR) {
    const opciones = simularEnvio ? {
        envioHabilitado: true,
        enviar: crearEnvioOrden({ habilitado: true })
    } : {};

    const vista = (id) => (
        <MemoryRouter initialEntries={[entrada]}>
            <SesionConectadaContext.Provider value={{
                usuario: { id, nombre: 'Cliente de prueba', correo: 'test@example.test', rol: 'CLIENTE' },
                solicitar: (operacion) => operacion(() => TOKEN)
            }}>
            <CarritoProvider>
                <Link to={RUTA_CARRITO_CONECTADO}>Abrir carrito</Link>
                <Routes>
                    <Route element={<RevisionCarritoConectado />}>
                        <Route path={RUTA_CARRITO_CONECTADO} element={<Carrito conectado />} />
                        <Route path={RUTA_CHECKOUT_CONECTADO} element={<Checkout conectado />} />
                        <Route path={RUTA_COMPRA_CONECTADA} element={<CompraConectada {...opciones} />} />
                    </Route>
                </Routes>
            </CarritoProvider>
            </SesionConectadaContext.Provider>
        </MemoryRouter>
    );
    const resultado = render(vista(comprador));
    return { ...resultado, cambiarCuenta: (id) => resultado.rerender(vista(id)) };
}

function posts(fetchSimulado) {
    return fetchSimulado.calls.allArgs().filter(([, opciones]) => opciones.method === 'POST');
}

async function botonConfirmarHabilitado() {
    const boton = screen.getByRole('button', { name: 'Confirmar compra' });
    await esperarHabilitado(boton);
    return boton;
}

function esperarHabilitado(boton) {
    return waitFor(() => {
        if (boton.disabled) throw new Error('El botón sigue deshabilitado.');
    });
}

function esperarPost(fetchSimulado, cantidad = 1) {
    return waitFor(() => {
        if (posts(fetchSimulado).length !== cantidad) throw new Error('Todavía no se observa el POST esperado.');
    });
}

describe('Compra conectada', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => { cleanup(); localStorage.clear(); });

    it('conserva las cantidades al recargar, valida el stock y permite eliminar', async () => {
        guardarCarrito();
        simulacionApi();
        const primeraVista = renderizar(RUTA_CARRITO_CONECTADO);
        await screen.findByRole('link', { name: 'Continuar al checkout' });
        const cantidad = screen.getByRole('spinbutton', { name: 'Cantidad:' });

        fireEvent.change(cantidad, { target: { value: '8' } });
        expect(cantidad.value).toBe('1');
        fireEvent.change(cantidad, { target: { value: '1.5' } });
        expect(cantidad.value).toBe('1');
        fireEvent.change(cantidad, { target: { value: '2' } });
        expect(cantidad.value).toBe('2');

        primeraVista.unmount();
        renderizar(RUTA_CARRITO_CONECTADO);
        await screen.findByRole('link', { name: 'Continuar al checkout' });
        expect(screen.getByRole('spinbutton', { name: 'Cantidad:' }).value).toBe('2');
        fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
        expect(screen.getByText('Tu carrito está vacío')).toBeTruthy();
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito).toEqual([]);
    });

    it('actualiza el precio mostrado y conserva las cantidades si baja el stock', async () => {
        guardarCarrito();
        const guardado = localStorage.getItem(CLAVE);
        simulacionApi({ productos: [{ ...producto, precioFinal: 29500, stock: 0 }] });
        renderizar(RUTA_CARRITO_CONECTADO);

        expect(await screen.findByText(/Hay precios actualizados por el servidor/)).toBeTruthy();
        expect(screen.getByText('Total estimado: $29.500')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Continuar al checkout' }).disabled).toBeTrue();
        expect(localStorage.getItem(CLAVE)).toBe(guardado);
    });

    it('importa una copia solo si se confirma y evita sumar dos veces la misma cantidad', async () => {
        const local = JSON.stringify([{ id: 1, codigo: producto.codigo, cantidad: 2, precio: 28000, stock: 3 }]);
        localStorage.setItem('carritoAutoCare', local);
        simulacionApi();
        renderizar(RUTA_CARRITO_CONECTADO);
        const revisar = screen.getByRole('button', { name: 'Revisar importación del carrito local' });
        await esperarHabilitado(revisar);

        fireEvent.click(revisar);
        expect(screen.getByText('Propuesta de importación')).toBeTruthy();
        expect(localStorage.getItem(CLAVE)).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
        expect(localStorage.getItem(CLAVE)).toBeNull();
        for (let vez = 0; vez < 2; vez++) {
            fireEvent.click(revisar);
            fireEvent.click(screen.getByRole('button', { name: 'Confirmar importación' }));
        }
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito).toEqual([
            jasmine.objectContaining({ id: ID, cantidad: 2 })
        ]);
        expect(localStorage.getItem('carritoAutoCare')).toBe(local);
    });

    it('impide revisar la compra conectada si falta la dirección de entrega', async () => {
        guardarCarrito();
        const fetchSimulado = simulacionApi();
        renderizar(RUTA_CHECKOUT_CONECTADO);
        const revisar = screen.getByRole('button', { name: 'Revisar compra' });
        await esperarHabilitado(revisar);
        for (const [etiqueta, value] of Object.entries({
            Teléfono: '900000000', Comuna: 'Santiago', 'Método de entrega': 'Envío estándar'
        })) {
            fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } });
        }
        expect(screen.getByLabelText('Dirección de entrega').validity.valueMissing).toBeTrue();
        expect(revisar.form.checkValidity()).toBeFalse();
        fireEvent.click(revisar);
        expect(screen.getByRole('heading', { name: 'Checkout conectado' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Confirmar compra' })).toBeNull();
        expect(posts(fetchSimulado)).toEqual([]);
    });

    it('mantiene el formulario y muestra una solicitud sin precios ni datos de entrega', async () => {
        guardarCarrito();
        const fetchSimulado = simulacionApi();
        renderizar(RUTA_CHECKOUT_CONECTADO);
        const datos = { 'Nombre completo': 'Cliente de prueba', 'Correo electrónico': 'test@example.test',
            Teléfono: '900000000', Comuna: 'Santiago', 'Dirección de entrega': 'Calle de prueba 10',
            'Método de entrega': 'Envío estándar' };
        for (const [etiqueta, value] of Object.entries(datos)) {
            fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } });
        }
        const revisar = screen.getByRole('button', { name: 'Revisar compra' });
        await esperarHabilitado(revisar);
        fireEvent.click(revisar);

        expect(screen.getByText('Entrega seleccionada: Envío estándar')).toBeTruthy();
        expect(JSON.parse(document.querySelector('pre').textContent)).toEqual({
            productos: [{ productoId: ID, cantidad: 1 }]
        });
        const confirmar = screen.getByRole('button', { name: 'Confirmar compra' });
        expect(confirmar.disabled).toBeTrue();
        fireEvent.click(confirmar);
        expect(posts(fetchSimulado)).toEqual([]);
        await expectAsync(enviarOrdenApi({ id: ORDEN_ID, cuerpo: JSON.stringify(solicitud) }))
            .toBeRejectedWithError(/deshabilitado/);
        fireEvent.click(screen.getByRole('link', { name: 'Volver al checkout' }));
        expect(screen.getByLabelText('Comuna').value).toBe('Santiago');
    });

    it('procesa un 201 simulado, usa el total del servidor y conserva el carrito local y sus órdenes', async () => {
        guardarCarrito();
        localStorage.setItem('carritoAutoCare', '[{"id":1,"cantidad":2}]');
        localStorage.setItem('ordenesAutoCare', '[{"id":123,"total":500}]');
        let responder;
        let intentoAlEnviar;
        const fetchSimulado = simulacionApi({ post: () => {
            intentoAlEnviar = JSON.parse(localStorage.getItem(CLAVE)).intento;
            return new Promise((resolve) => { responder = resolve; });
        } });
        renderizar(entrega, true);
        const boton = await botonConfirmarHabilitado();
        expect(screen.getByText('$28.000')).toBeTruthy();

        fireEvent.click(boton);
        fireEvent.click(boton);
        await esperarPost(fetchSimulado);
        const [, peticion] = posts(fetchSimulado)[0];
        const id = peticion.headers['Idempotency-Key'];
        expect(id).toMatch(/^[0-9a-f]{24}$/);
        expect(peticion.headers.Authorization).toBe(`Bearer ${TOKEN}`);
        expect(intentoAlEnviar).toEqual({ id, cuerpo: peticion.body, compradorId: COMPRADOR });
        expect(JSON.parse(peticion.body)).toEqual(solicitud);
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito.length).toBe(1);
        responder(Response.json(orden(id), { status: 201 }));

        expect(await screen.findByRole('heading', { name: 'Orden confirmada' })).toBeTruthy();
        expect(screen.getByText('$27.500')).toBeTruthy();
        expect(screen.getByText(id)).toBeTruthy();
        expect(screen.getByText('Aceite de prueba × 1')).toBeTruthy();
        expect(posts(fetchSimulado).length).toBe(1);
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito).toEqual([]);
        expect(localStorage.getItem('carritoAutoCare')).toBe('[{"id":1,"cantidad":2}]');
        expect(localStorage.getItem('ordenesAutoCare')).toBe('[{"id":123,"total":500}]');
    });

    for (const [estado, mensaje] of [[400, 'Datos inválidos.'], [404, 'ya no está disponible'],
        [409, 'Stock insuficiente o conflicto']]) {
        it(`informa HTTP ${estado} y conserva el carrito`, async () => {
            guardarCarrito();
            const detail = estado === 409 ? 'Stock insuficiente para el producto. Detalle de prueba.' : 'Detalle de prueba.';
            const campos = estado === 400 ? { 'productos[0].cantidad': 'Debe ser positiva.' } : undefined;
            const fetchSimulado = simulacionApi({ post: () => Response.json({ detail, campos }, { status: estado }) });
            renderizar(entrega, true);
            fireEvent.click(await botonConfirmarHabilitado());

            expect((await screen.findByRole('alert')).textContent).toContain(mensaje);
            expect((await screen.findByRole('alert')).textContent).toContain('Detalle de prueba.');
            if (estado === 400) expect(screen.getByText('productos[0].cantidad · Debe ser positiva.')).toBeTruthy();
            const guardado = JSON.parse(localStorage.getItem(CLAVE));
            expect(guardado.carrito.length).toBe(1);
            expect(guardado.intento).toBeNull();
            expect(posts(fetchSimulado).length).toBe(1);
        });
    }

    it('ante 503 consulta solo por GET y conserva el bloqueo tras un 404 y una recarga', async () => {
        guardarCarrito();
        let existe = false;
        const fetchSimulado = simulacionApi({
            post: () => Response.json({ detail: `No se pudo confirmar el resultado de la orden ${ORDEN_ID}.` }, { status: 503 }),
            getOrden: (id) => existe ? Response.json(orden(id)) : Response.json({}, { status: 404 })
        });
        const vista = renderizar(entrega, true);
        fireEvent.click(await botonConfirmarHabilitado());
        await screen.findByText('La orden sigue sin confirmación. Puedes volver a consultarla.');
        const id = posts(fetchSimulado)[0][1].headers['Idempotency-Key'];
        expect(fetchSimulado).toHaveBeenCalledWith(`/api/v1/ordenes/${id}`, jasmine.objectContaining({
            method: 'GET', headers: jasmine.objectContaining({ Authorization: `Bearer ${TOKEN}` })
        }));
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito.length).toBe(1);

        vista.unmount();
        renderizar(RUTA_COMPRA_CONECTADA);
        expect(screen.queryByRole('button', { name: 'Confirmar compra' })).toBeNull();
        existe = true;
        fireEvent.click(screen.getByRole('button', { name: 'Consultar orden' }));
        expect(await screen.findByRole('heading', { name: 'Orden confirmada' })).toBeTruthy();
        expect(posts(fetchSimulado).length).toBe(1);
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito).toEqual([]);
    });

    it('mantiene el carrito y no reenvía el POST si se pierde la conexión sin recibir respuesta', async () => {
        guardarCarrito();
        const fetchSimulado = simulacionApi({ post: () => { throw new TypeError('Failed to fetch'); } });
        const vista = renderizar(entrega, true);
        fireEvent.click(await botonConfirmarHabilitado());
        await screen.findByText(/La orden sigue sin confirmación/);
        const intento = JSON.parse(localStorage.getItem(CLAVE)).intento;
        expect(fetchSimulado).toHaveBeenCalledWith(`/api/v1/ordenes/${intento.id}`, jasmine.objectContaining({ method: 'GET' }));

        vista.unmount();
        renderizar(entrega, true);
        expect(screen.getByRole('heading', { name: 'Compra pendiente de verificación' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Confirmar compra' })).toBeNull();
        expect(posts(fetchSimulado).length).toBe(1);
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito.length).toBe(1);
        expect(JSON.parse(localStorage.getItem(CLAVE)).intento).toEqual(intento);
    });

    it('conserva el carrito si el POST devuelve un 200 en vez de confirmar la creación', async () => {
        guardarCarrito();
        const fetchSimulado = simulacionApi({ post: ({ headers }) => Response.json(orden(headers['Idempotency-Key'])) });
        renderizar(entrega, true);
        fireEvent.click(await botonConfirmarHabilitado());

        expect(await screen.findByText(/La orden sigue sin confirmación/)).toBeTruthy();
        expect(screen.queryByRole('heading', { name: 'Orden confirmada' })).toBeNull();
        expect(posts(fetchSimulado).length).toBe(1);
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito.length).toBe(1);
    });

    it('genera 24 caracteres hexadecimales a partir de 12 bytes aleatorios', () => {
        const aleatorio = spyOn(crypto, 'getRandomValues').and.callFake((bytes) => bytes.fill(10));
        expect(generarClaveOrden()).toBe('0a'.repeat(12));
        expect(aleatorio.calls.count()).toBe(1);
        expect(aleatorio.calls.mostRecent().args[0]).toEqual(new Uint8Array(12).fill(10));
    });

    it('reenvía el JSON exacto con la misma clave después de recargar ante un 503', async () => {
        guardarCarrito();
        let responderExito = false;
        const fetchSimulado = simulacionApi({ post: ({ headers }) => responderExito
            ? Response.json(orden(headers['Idempotency-Key']), { status: 201 })
            : Response.json({ detail: 'Confirmación incierta.' }, { status: 503 }) });
        const vista = renderizar(entrega, true);
        fireEvent.click(await botonConfirmarHabilitado());
        await screen.findByText(/La orden sigue sin confirmación/);
        const intento = JSON.parse(localStorage.getItem(CLAVE)).intento;

        vista.unmount();
        renderizar(RUTA_COMPRA_CONECTADA, true);
        const reintentar = screen.getByRole('button', { name: 'Reintentar la misma compra' });
        await esperarHabilitado(reintentar);
        responderExito = true;
        fireEvent.click(reintentar);
        expect(await screen.findByRole('heading', { name: 'Orden confirmada' })).toBeTruthy();
        expect(posts(fetchSimulado).map(([, { body, headers }]) => ({ cuerpo: body, id: headers['Idempotency-Key'] })))
            .toEqual([{ id: intento.id, cuerpo: intento.cuerpo }, { id: intento.id, cuerpo: intento.cuerpo }]);
    });

    it('muestra un conflicto de clave y conserva el intento si el GET devuelve otras cantidades', async () => {
        guardarCarrito();
        const fetchSimulado = simulacionApi({
            post: () => Response.json({ detail: 'La clave Idempotency-Key ya pertenece a otra compra.' }, { status: 409 }),
            getOrden: (id) => Response.json(orden(id, 2))
        });
        renderizar(entrega, true);
        fireEvent.click(await botonConfirmarHabilitado());
        expect(await screen.findByText(/La clave Idempotency-Key ya pertenece/)).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Consultar orden' }));
        expect(await screen.findByText(/La API no entregó una confirmación válida/)).toBeTruthy();
        const guardado = JSON.parse(localStorage.getItem(CLAVE));
        expect(guardado.carrito.length).toBe(1);
        expect(guardado.intento.id).toBe(posts(fetchSimulado)[0][1].headers['Idempotency-Key']);
    });

    it('usa otra clave solo si se modifica un carrito que recibió un rechazo definitivo', async () => {
        guardarCarrito();
        const fetchSimulado = simulacionApi({ post: () => Response.json({ detail: 'Datos de prueba.' }, { status: 400 }) });
        const vista = renderizar(entrega, true);
        fireEvent.click(await botonConfirmarHabilitado());
        await screen.findByText(/Datos inválidos/);
        fireEvent.click(await botonConfirmarHabilitado());
        await screen.findByText(/Datos inválidos/);
        const [[, primero], [, segundo]] = posts(fetchSimulado);
        expect(segundo.headers['Idempotency-Key']).toBe(primero.headers['Idempotency-Key']);
        expect(segundo.body).toBe(primero.body);

        vista.unmount();
        const carrito = renderizar(RUTA_CARRITO_CONECTADO);
        await screen.findByRole('link', { name: 'Continuar al checkout' });
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Cantidad:' }), { target: { value: '2' } });
        carrito.unmount();
        renderizar(entrega, true);
        fireEvent.click(await botonConfirmarHabilitado());
        await screen.findByText(/Datos inválidos/);
        const [, tercero] = posts(fetchSimulado)[2];
        expect(tercero.headers['Idempotency-Key']).not.toBe(primero.headers['Idempotency-Key']);
        expect(JSON.parse(tercero.body).productos[0].cantidad).toBe(2);
    });

    it('rechaza productos originales en pantalla y vuelve a verificar los códigos en el cliente REST', async () => {
        guardarCarrito();
        const original = { ...producto, codigo: 'ACE001' };
        const fetchSimulado = simulacionApi({ productos: [original] });
        renderizar(entrega, true);
        await waitFor(() => {
            if (screen.queryByText('Consultando precios y stock…')) throw new Error('Catálogo pendiente.');
        });
        const confirmar = screen.getByRole('button', { name: 'Confirmar compra' });
        expect(confirmar.disabled).toBeTrue();
        fireEvent.click(confirmar);

        await expectAsync(crearEnvioOrden({ habilitado: true })({ id: ORDEN_ID, cuerpo: JSON.stringify(solicitud) }))
            .toBeRejectedWithError(/únicamente productos temporales/);
        expect(fetchSimulado).toHaveBeenCalledWith('/api/v1/productos', jasmine.objectContaining({ cache: 'no-store' }));
        expect(posts(fetchSimulado)).toEqual([]);
    });

    it('rechaza una solicitud con un producto ausente aunque contenga otro producto temporal', async () => {
        const fetchSimulado = simulacionApi();
        const ausente = { productoId: '6600000000000000000000ff', cantidad: 1 };
        await expectAsync(crearEnvioOrden({ habilitado: true })({ id: ORDEN_ID,
            cuerpo: JSON.stringify({ productos: [...solicitud.productos, ausente] }) }))
            .toBeRejectedWithError(/únicamente productos temporales/);
        expect(posts(fetchSimulado)).toEqual([]);
    });

    it('bloquea el POST si no puede persistir la clave y el cuerpo', async () => {
        guardarCarrito();
        const fetchSimulado = simulacionApi();
        renderizar(entrega, true);
        const boton = await botonConfirmarHabilitado();
        spyOn(Storage.prototype, 'setItem').and.throwError('Sin espacio.');
        fireEvent.click(boton);

        expect(await screen.findByText(/No se pudo guardar o actualizar el intento/)).toBeTruthy();
        expect(posts(fetchSimulado)).toEqual([]);
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito.length).toBe(1);
    });

    it('aplica un 201 tardío tras navegar y descuenta solo las cantidades que corresponden', async () => {
        guardarCarrito();
        let responder;
        const fetchSimulado = simulacionApi({ post: () => new Promise((resolver) => { responder = resolver; }) });
        renderizar(entrega, true);
        fireEvent.click(await botonConfirmarHabilitado());
        await esperarPost(fetchSimulado);
        fireEvent.click(screen.getByRole('link', { name: 'Abrir carrito' }));
        expect(screen.getByRole('heading', { name: 'Carrito conectado' })).toBeTruthy();

        const otro = lineaCarritoConectado({ ...producto, id: '6600000000000000000000ff' }, 1);
        const guardado = JSON.parse(localStorage.getItem(CLAVE));
        // Simula una actualización de almacenamiento que llegó mientras estaba pendiente el envío.
        localStorage.setItem(CLAVE, JSON.stringify({ ...guardado,
            carrito: [{ ...guardado.carrito[0], cantidad: 2 }, otro] }));
        responder(Response.json(orden(guardado.intento.id), { status: 201 }));

        await waitFor(() => {
            if (JSON.parse(localStorage.getItem(CLAVE)).intento) throw new Error('Compra aún pendiente.');
        });
        const final = JSON.parse(localStorage.getItem(CLAVE));
        expect(final.carrito.map(({ id, cantidad }) => [id, cantidad])).toEqual([[ID, 1], [otro.id, 1]]);
        expect(final.ordenConfirmada.id).toBe(guardado.intento.id);
    });

    it('aísla la recuperación del intento al cambiar de comprador sin reenviarlo', async () => {
        guardarCarrito();
        const intento = { id: ORDEN_ID, cuerpo: JSON.stringify(solicitud), compradorId: COMPRADOR };
        const original = JSON.parse(localStorage.getItem(CLAVE));
        localStorage.setItem(CLAVE, JSON.stringify({ ...original, intento }));
        const fetchSimulado = simulacionApi({ getOrden: () => Response.json(orden(ORDEN_ID)) });
        const vista = renderizar(RUTA_COMPRA_CONECTADA, true);
        expect(screen.getByText(new RegExp(ORDEN_ID))).toBeTruthy();

        vista.cambiarCuenta(OTRO_COMPRADOR);
        expect(screen.queryByText(new RegExp(ORDEN_ID))).toBeNull();
        expect(screen.queryByRole('button', { name: 'Consultar orden' })).toBeNull();
        expect(fetchSimulado.calls.allArgs().filter(([url]) => url.includes('/ordenes'))).toEqual([]);

        vista.cambiarCuenta(COMPRADOR);
        fireEvent.click(screen.getByRole('button', { name: 'Consultar orden' }));
        expect(await screen.findByRole('heading', { name: 'Orden confirmada' })).toBeTruthy();
        expect(posts(fetchSimulado)).toEqual([]);
        expect(localStorage.getItem(`carritoConectadoAutoCare:${OTRO_COMPRADOR}`)).toBeNull();
    });
});
