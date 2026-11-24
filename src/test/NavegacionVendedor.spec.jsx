import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { RUTA_ADMIN_CONECTADA, RUTA_CARRITO_CONECTADO, RUTA_CATALOGO_CONECTADO, RUTA_CHECKOUT_CONECTADO,
    RUTA_COMPRA_CONECTADA, RUTA_LOGIN_CONECTADO, RUTA_ORDENES_CONECTADAS, RUTA_PERFIL_CONECTADO,
    RUTA_REGISTRO_CONECTADO } from '../context/catalogo.js';
import SesionConectadaProvider from '../context/SesionConectadaProvider.jsx';
import { CLAVE_SESION_CONECTADA } from '../context/sesionConectada.js';

const usuario = { id: '6400000000000000000000a1', nombre: 'Usuario de prueba', correo: 'prueba@example.test' };
const categoria = { id: '6500000000000000000000a1', nombre: 'Mantención' };
const producto = { id: '6600000000000000000000a1', nombre: 'Aceite de prueba', codigo: 'ACE-01',
    categoriaId: categoria.id, categoria: categoria.nombre, precio: 10000, descuento: 10, precioFinal: 9000, stock: 3 };
const orden = { id: '6700000000000000000000a1', estado: 'PROCESANDO', total: 9000,
    productos: [{ productoId: producto.id, nombre: producto.nombre, cantidad: 1, subtotal: 9000 }] };
const token = 'token-simulado';

function montar(ruta, rol = 'VENDEDOR') {
    if (rol) sessionStorage.setItem(CLAVE_SESION_CONECTADA, JSON.stringify({ token, expiraEn: Date.now() + 60000 }));
    const datos = {
        '/api/v1/auth/me': { ...usuario, rol },
        '/api/v1/productos': [producto],
        '/api/v1/categorias': [categoria],
        '/api/v1/ordenes': [orden],
        [`/api/v1/ordenes/${orden.id}`]: orden
    };
    const peticiones = spyOn(window, 'fetch').and.callFake(async (url, opciones) => {
        if (opciones.method !== 'GET' || !Object.hasOwn(datos, url)) throw new Error('Solicitud inesperada en la prueba.');
        return Response.json(datos[url]);
    });
    window.history.replaceState(null, '', ruta);
    render(<SesionConectadaProvider>
        <CarritoProvider><App /></CarritoProvider>
    </SesionConectadaProvider>);
    return peticiones;
}

function navbar() {
    return within(screen.getByRole('navigation'));
}

describe('Navegación del vendedor conectado', () => {
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

    it('muestra el nombre sin enlace y limita el menú a Productos y Órdenes', async () => {
        const peticiones = montar(RUTA_CATALOGO_CONECTADO);
        expect(await navbar().findByRole('button', { name: 'Cerrar sesión' })).toBeTruthy();
        expect(navbar().getByText(usuario.nombre)).toBeTruthy();
        expect(navbar().getAllByRole('link').map((link) => [link.textContent.trim(), link.getAttribute('href')])).toEqual([
            ['AutoCarePro', RUTA_CATALOGO_CONECTADO],
            ['Productos', RUTA_CATALOGO_CONECTADO],
            ['Órdenes', RUTA_ORDENES_CONECTADAS]
        ]);
        expect(screen.queryByRole('link', { name: 'Volver al catálogo local' })).toBeNull();
        expect(screen.queryByRole('link', { name: 'Facebook' })).toBeNull();
        expect(peticiones).toHaveBeenCalledWith('/api/v1/auth/me', jasmine.objectContaining({
            method: 'GET', headers: jasmine.objectContaining({ Authorization: `Bearer ${token}` })
        }));
    });

    it('permite consultar el detalle de un producto y volver al listado conectado con el logo', async () => {
        montar(RUTA_CATALOGO_CONECTADO);
        const detalle = await screen.findByRole('link', { name: 'Ver detalle' });
        fireEvent.click(detalle);
        expect(await screen.findByRole('heading', { name: producto.nombre })).toBeTruthy();
        expect(window.location.pathname).toBe(`${RUTA_CATALOGO_CONECTADO}/${producto.id}`);
        expect(screen.queryByRole('button', { name: /agregar al carrito/i })).toBeNull();
        fireEvent.click(navbar().getByRole('link', { name: 'AutoCarePro' }));
        expect(await screen.findByRole('heading', { name: 'Catálogo de Productos' })).toBeTruthy();
        expect(window.location.pathname).toBe(RUTA_CATALOGO_CONECTADO);
    });

    it('permite consultar el listado y el detalle de órdenes', async () => {
        const peticiones = montar(RUTA_CATALOGO_CONECTADO);
        await navbar().findByRole('button', { name: 'Cerrar sesión' });
        fireEvent.click(navbar().getByRole('link', { name: 'Órdenes' }));
        expect(await screen.findByRole('heading', { name: 'Órdenes conectadas' })).toBeTruthy();
        fireEvent.click(await screen.findByRole('link', { name: `Orden ${orden.id}` }));
        expect(await screen.findByRole('heading', { name: `Orden ${orden.id}` })).toBeTruthy();
        expect(peticiones).toHaveBeenCalledWith(`/api/v1/ordenes/${orden.id}`, jasmine.objectContaining({
            method: 'GET', headers: jasmine.objectContaining({ Authorization: `Bearer ${token}` })
        }));
    });

    for (const [nombre, ruta] of [
        ['administración', RUTA_ADMIN_CONECTADA],
        ['carrito conectado', RUTA_CARRITO_CONECTADO],
        ['checkout conectado', RUTA_CHECKOUT_CONECTADO],
        ['confirmación de compra', RUTA_COMPRA_CONECTADA],
        ['perfil', RUTA_PERFIL_CONECTADO],
        ['categorías', `${RUTA_CATALOGO_CONECTADO}/categorias`],
        ['ofertas', `${RUTA_CATALOGO_CONECTADO}/ofertas`],
        ['login', RUTA_LOGIN_CONECTADO],
        ['registro', RUTA_REGISTRO_CONECTADO]
    ]) {
        it(`deniega acceso directo a ${nombre} y ofrece volver al catálogo`, async () => {
            const peticiones = montar(ruta);
            const alerta = await screen.findByRole('alert');
            expect(alerta.textContent).toContain('Tu rol no tiene permiso');
            expect(within(alerta).getByRole('link', { name: 'Volver al catálogo conectado' }).getAttribute('href'))
                .toBe(RUTA_CATALOGO_CONECTADO);
            expect(peticiones.calls.allArgs().every(([, opciones]) => opciones.method === 'GET')).toBeTrue();
        });
    }

    for (const rol of ['ADMIN', 'CLIENTE']) {
        it(`conserva la navegación de ${rol} y su acceso al perfil conectado`, async () => {
            montar(RUTA_CATALOGO_CONECTADO, rol);
            await navbar().findByRole('button', { name: 'Cerrar sesión' });
            for (const enlace of ['Inicio', 'Categorías', 'Ofertas', 'Nosotros', 'Blog', 'Contacto', 'Carrito conectado']) {
                expect(navbar().getByRole('link', { name: enlace })).toBeTruthy();
            }
            expect(Boolean(navbar().queryByRole('link', { name: 'Administración' }))).toBe(rol === 'ADMIN');
            expect(screen.getByRole('link', { name: 'Volver al catálogo local' })).toBeTruthy();
            fireEvent.click(navbar().getByRole('link', { name: usuario.nombre }));
            expect(await screen.findByRole('heading', { name: 'Mi perfil conectado' })).toBeTruthy();
        });
    }

    it('conserva el acceso público a categorías y ofertas', async () => {
        montar(`${RUTA_CATALOGO_CONECTADO}/categorias`, null);
        expect(await screen.findByRole('heading', { name: 'Categorías' })).toBeTruthy();
        fireEvent.click(navbar().getByRole('link', { name: 'Ofertas' }));
        expect(await screen.findByRole('heading', { name: 'Ofertas' })).toBeTruthy();
    });

    it('mantiene la navegación y el catálogo de la tienda local simulada', async () => {
        localStorage.setItem('sesionAutoCare', JSON.stringify({ id: 1, nombre: 'Cliente local', rol: 'cliente' }));
        await act(async () => { montar('/productos'); });
        expect(screen.getByRole('heading', { name: 'Catálogo de Productos' })).toBeTruthy();
        for (const [nombre, ruta] of [['Inicio', '/'], ['Categorías', '/categorias'], ['Mis órdenes', '/ordenes'],
            ['Mis incidencias', '/incidencias'], ['Cliente local', '/perfil']]) {
            expect(navbar().getByRole('link', { name: nombre }).getAttribute('href')).toBe(ruta);
        }
    });

    it('cierra la sesión del vendedor y vuelve al inicio de sesión conectado', async () => {
        const sesionLocal = JSON.stringify({ id: 1, nombre: 'Cliente local', rol: 'cliente' });
        localStorage.setItem('sesionAutoCare', sesionLocal);
        montar(RUTA_ORDENES_CONECTADAS);
        fireEvent.click(await navbar().findByRole('button', { name: 'Cerrar sesión' }));
        expect(await screen.findByRole('heading', { name: 'Iniciar sesión conectada' })).toBeTruthy();
        expect(navbar().queryByText(usuario.nombre)).toBeNull();
        expect(window.location.pathname).toBe(RUTA_LOGIN_CONECTADO);
        expect(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).toBeNull();
        expect(localStorage.getItem('sesionAutoCare')).toBe(sesionLocal);
    });
});
