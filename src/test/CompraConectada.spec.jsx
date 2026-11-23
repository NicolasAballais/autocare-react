import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { RUTA_CARRITO_CONECTADO, RUTA_CHECKOUT_CONECTADO, RUTA_COMPRA_CONECTADA } from '../context/catalogo.js';
import Carrito from '../pages/Carrito.jsx';
import Checkout from '../pages/Checkout.jsx';
import CompraConectada from '../pages/CompraConectada.jsx';
import RevisionCarritoConectado from '../pages/RevisionCarritoConectado.jsx';
import { enviarJsonApi } from '../services/api.js';
import { lineaCarritoConectado } from '../services/carritoService.js';
import { enviarOrdenApi } from '../services/ordenesApi.js';

const CLAVE = 'carritoConectadoAutoCare';
const ID = '6600000000000000000000a1';
const ORDEN_ID = '6700000000000000000000a2';
const producto = { id: ID, codigo: 'ACE001', nombre: 'Aceite de prueba', precio: 35000,
    precioFinal: 28000, descuento: 20, stock: 3 };
const orden = { id: ORDEN_ID, estado: 'PROCESANDO', total: 27500 };
const entrega = {
    pathname: RUTA_COMPRA_CONECTADA,
    state: { datosCliente: { nombre: 'Cliente de prueba' }, tipoEntrega: 'Envío estándar' }
};

function guardarCarrito() {
    localStorage.setItem(CLAVE, JSON.stringify({ carrito: [lineaCarritoConectado(producto, 1)], intento: null }));
}

function simulacionApi({ productos = [producto], post, getOrden } = {}) {
    return spyOn(window, 'fetch').and.callFake(async (url, opciones) => {
        if (url === '/api/v1/productos' && opciones.method === 'GET') return Response.json(productos);
        if (url === '/api/v1/ordenes' && opciones.method === 'POST' && post) return post();
        if (url === `/api/v1/ordenes/${ORDEN_ID}` && opciones.method === 'GET' && getOrden) return getOrden();
        throw new Error(`Solicitud no prevista: ${opciones.method} ${url}`);
    });
}

function renderizar(entrada, simularEnvio = false) {
    const opciones = simularEnvio ? {
        envioHabilitado: true,
        enviar: (solicitud) => enviarJsonApi('/ordenes', solicitud, { estadoEsperado: 201 })
    } : {};

    return render(
        <MemoryRouter initialEntries={[entrada]}>
            <CarritoProvider>
                <Routes>
                    <Route element={<RevisionCarritoConectado />}>
                        <Route path={RUTA_CARRITO_CONECTADO} element={<Carrito conectado />} />
                        <Route path={RUTA_CHECKOUT_CONECTADO} element={<Checkout conectado />} />
                        <Route path={RUTA_COMPRA_CONECTADA} element={<CompraConectada {...opciones} />} />
                    </Route>
                </Routes>
            </CarritoProvider>
        </MemoryRouter>
    );
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
        expect(() => enviarOrdenApi({ productos: [{ productoId: ID, cantidad: 1 }] })).toThrowError(/deshabilitado/);
        fireEvent.click(screen.getByRole('link', { name: 'Volver al checkout' }));
        expect(screen.getByLabelText('Comuna').value).toBe('Santiago');
    });

    it('procesa un 201 simulado, usa el total del servidor y conserva el carrito local y sus órdenes', async () => {
        guardarCarrito();
        localStorage.setItem('carritoAutoCare', '[{"id":1,"cantidad":2}]');
        localStorage.setItem('ordenesAutoCare', '[{"id":123,"total":500}]');
        let responder;
        const fetchSimulado = simulacionApi({ post: () => new Promise((resolve) => { responder = resolve; }) });
        renderizar(entrega, true);
        const boton = await botonConfirmarHabilitado();
        expect(screen.getByText('$28.000')).toBeTruthy();

        fireEvent.click(boton);
        fireEvent.click(boton);
        expect(posts(fetchSimulado).length).toBe(1);
        expect(JSON.parse(posts(fetchSimulado)[0][1].body)).toEqual({ productos: [{ productoId: ID, cantidad: 1 }] });
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito.length).toBe(1);
        responder(Response.json(orden, { status: 201 }));

        expect(await screen.findByRole('heading', { name: 'Orden confirmada' })).toBeTruthy();
        expect(screen.getByText('$27.500')).toBeTruthy();
        expect(screen.getByText(ORDEN_ID)).toBeTruthy();
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito).toEqual([]);
        expect(localStorage.getItem('carritoAutoCare')).toBe('[{"id":1,"cantidad":2}]');
        expect(localStorage.getItem('ordenesAutoCare')).toBe('[{"id":123,"total":500}]');
    });

    for (const [estado, mensaje] of [[400, 'Datos inválidos.'], [404, 'ya no está disponible'],
        [409, 'Stock insuficiente o conflicto']]) {
        it(`informa HTTP ${estado} y conserva el carrito`, async () => {
            guardarCarrito();
            const fetchSimulado = simulacionApi({ post: () => Response.json({ detail: 'Detalle de prueba.' }, { status: estado }) });
            renderizar(entrega, true);
            fireEvent.click(await botonConfirmarHabilitado());

            expect((await screen.findByRole('alert')).textContent).toContain(mensaje);
            expect((await screen.findByRole('alert')).textContent).toContain('Detalle de prueba.');
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
            getOrden: () => existe ? Response.json(orden) : Response.json({}, { status: 404 })
        });
        const vista = renderizar(entrega, true);
        fireEvent.click(await botonConfirmarHabilitado());
        await screen.findByText('La orden sigue sin confirmación. Puedes volver a consultarla.');
        expect(fetchSimulado).toHaveBeenCalledWith(`/api/v1/ordenes/${ORDEN_ID}`, jasmine.objectContaining({ method: 'GET' }));
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

    it('mantiene el carrito y bloquea otro POST si se pierde la conexión sin conocer el ID', async () => {
        guardarCarrito();
        const fetchSimulado = simulacionApi({ post: () => { throw new TypeError('Failed to fetch'); } });
        const vista = renderizar(entrega, true);
        fireEvent.click(await botonConfirmarHabilitado());
        await screen.findByText(/La compra quedó sin confirmación/);

        vista.unmount();
        renderizar(entrega, true);
        expect(screen.getByRole('heading', { name: 'Compra pendiente de verificación' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Confirmar compra' })).toBeNull();
        expect(posts(fetchSimulado).length).toBe(1);
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito.length).toBe(1);
    });

    it('conserva el carrito si el POST devuelve un 200 en vez de confirmar la creación', async () => {
        guardarCarrito();
        const fetchSimulado = simulacionApi({ post: () => Response.json(orden) });
        renderizar(entrega, true);
        fireEvent.click(await botonConfirmarHabilitado());

        expect(await screen.findByText(/La compra quedó sin confirmación/)).toBeTruthy();
        expect(screen.queryByRole('heading', { name: 'Orden confirmada' })).toBeNull();
        expect(posts(fetchSimulado).length).toBe(1);
        expect(JSON.parse(localStorage.getItem(CLAVE)).carrito.length).toBe(1);
    });
});
