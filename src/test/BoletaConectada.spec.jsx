import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { RUTA_LOGIN_CONECTADO, RUTA_ORDENES_CONECTADAS } from '../context/catalogo.js';
import SesionConectadaProvider from '../context/SesionConectadaProvider.jsx';
import { CLAVE_SESION_CONECTADA } from '../context/sesionConectada.js';

const usuario = { id: '6400000000000000000000a1', nombre: 'Usuario de prueba', correo: 'prueba@example.test' };
const token = 'token-simulado';
const orden = {
    id: '6700000000000000000000a1', fechaCreacion: '2026-07-30T02:30:00Z', estado: 'PROCESANDO', total: 57234.5,
    productos: [
        { productoId: '6600000000000000000000a1', nombre: 'Aceite al comprar', cantidad: 2,
            precioOriginal: 32000, descuento: 12.5, precioUnitario: 28000, subtotal: 56000 },
        { productoId: '6600000000000000000000a2', nombre: 'Filtro al comprar', cantidad: 1,
            precioOriginal: 1234.5, descuento: 0, precioUnitario: 1234.5, subtotal: 1234.5 }
    ]
};
const rutaDetalle = `${RUTA_ORDENES_CONECTADAS}/${orden.id}`;
const rutaComprobante = `${rutaDetalle}/boleta`;
const apiOrden = `/api/v1/ordenes/${orden.id}`;

function montar(ruta, { rol = 'CLIENTE', estado = 200 } = {}) {
    if (rol) sessionStorage.setItem(CLAVE_SESION_CONECTADA, JSON.stringify({ token, expiraEn: Date.now() + 60000 }));
    const peticiones = spyOn(window, 'fetch').and.callFake(async (url, opciones) => {
        if (opciones.method === 'GET' && url === '/api/v1/auth/me') return Response.json({ ...usuario, rol });
        if (opciones.method === 'GET' && url === apiOrden) {
            return estado === 200 ? Response.json(orden) : Response.json({}, { status: estado });
        }
        throw new Error('Solicitud inesperada en la prueba del comprobante.');
    });
    window.history.replaceState(null, '', ruta);
    render(<SesionConectadaProvider>
        <CarritoProvider><App /></CarritoProvider>
    </SesionConectadaProvider>);
    return peticiones;
}

describe('Comprobante de compra conectado', () => {
    let urlAnterior;
    let historialAnterior;

    beforeEach(() => {
        urlAnterior = window.location.href;
        historialAnterior = window.history.state;
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        cleanup();
        window.history.replaceState(historialAnterior, '', urlAnterior);
        localStorage.clear();
        sessionStorage.clear();
    });

    it('CLIENTE lo abre desde su orden y ve los valores históricos del servidor', async () => {
        const peticiones = montar(rutaDetalle);
        fireEvent.click(await screen.findByRole('link', { name: 'Ver comprobante' }));
        expect(window.location.pathname).toBe(rutaComprobante);
        expect(screen.getByRole('heading', { name: 'Comprobante de compra' })).toBeTruthy();
        const tabla = await screen.findByRole('table');
        expect(screen.getByRole('heading', { name: `Orden ${orden.id}` })).toBeTruthy();
        expect(screen.getByText(new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short',
            timeZone: 'America/Santiago' }).format(new Date(orden.fechaCreacion))).getAttribute('datetime')).toBe(orden.fechaCreacion);
        expect(screen.getByText('Estado de la orden: PROCESANDO')).toBeTruthy();

        const aceite = within(tabla).getByRole('row', { name: /Aceite al comprar/ });
        const filtro = within(tabla).getByRole('row', { name: /Filtro al comprar/ });
        expect(within(aceite).getAllByRole('cell').map((celda) => celda.textContent))
            .toEqual(['2', '$32.000', '12,5 %', '$28.000', '$56.000']);
        expect(within(filtro).getAllByRole('cell').map((celda) => celda.textContent))
            .toEqual(['1', '$1.234,5', '0 %', '$1.234,5', '$1.234,5']);
        expect(screen.getByText('Total confirmado: $57.234,5')).toBeTruthy();
        expect(screen.getByText(/sin validez tributaria/)).toBeTruthy();
        expect(peticiones).toHaveBeenCalledWith(apiOrden, jasmine.objectContaining({ method: 'GET',
            headers: jasmine.objectContaining({ Authorization: `Bearer ${token}` }) }));
        expect(peticiones.calls.allArgs().every(([url]) => ['/api/v1/auth/me', apiOrden].includes(url))).toBeTrue();

        fireEvent.click(screen.getByRole('link', { name: 'Volver al detalle de la orden' }));
        expect(await screen.findByRole('heading', { name: 'Detalle de orden conectada' })).toBeTruthy();
    });

    for (const rol of ['VENDEDOR', 'ADMIN']) {
        it(`permite a ${rol} consultar el comprobante desde la URL directa`, async () => {
            montar(rutaComprobante, { rol });
            expect(await screen.findByRole('table')).toBeTruthy();
            expect(screen.getByText('Total confirmado: $57.234,5')).toBeTruthy();
        });
    }

    it('redirige al login conectado si falta la sesión', async () => {
        const peticiones = montar(rutaComprobante, { rol: null });
        expect(await screen.findByRole('heading', { name: 'Iniciar sesión conectada' })).toBeTruthy();
        expect(window.location.pathname).toBe(RUTA_LOGIN_CONECTADO);
        expect(peticiones).not.toHaveBeenCalled();
    });

    for (const [estado, mensaje] of [[404, 'Orden no encontrada.'], [403, 'No tienes permiso para consultar órdenes.']]) {
        it(`oculta el comprobante cuando Spring responde ${estado} al CLIENTE`, async () => {
            const peticiones = montar(rutaComprobante, { estado });
            expect((await screen.findByRole('alert')).textContent).toBe(mensaje);
            expect(peticiones).toHaveBeenCalledWith(apiOrden, jasmine.objectContaining({ method: 'GET',
                headers: jasmine.objectContaining({ Authorization: `Bearer ${token}` }) }));
            expect(screen.queryByRole('table')).toBeNull();
            expect(screen.queryByText(/Total confirmado/)).toBeNull();
        });
    }

    it('rechaza una URL con ID inválido antes de consultar la orden', async () => {
        const peticiones = montar(`${RUTA_ORDENES_CONECTADAS}/invalido/boleta`);
        expect((await screen.findByRole('alert')).textContent).toBe('No se pudieron consultar las órdenes.');
        expect(peticiones.calls.allArgs().map(([url]) => url)).toEqual(['/api/v1/auth/me']);
        expect(screen.queryByRole('table')).toBeNull();
    });
});
