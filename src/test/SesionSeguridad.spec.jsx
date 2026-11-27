import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RutaConectada from '../components/RutaConectada.jsx';
import SesionConectadaProvider from '../context/SesionConectadaProvider.jsx';
import { CLAVE_SESION_CONECTADA, SesionConectadaContext, useSesionConectada } from '../context/sesionConectada.js';
import { CarritoConectadoProvider, useCarritoConectado } from '../context/CarritoConectadoContext.jsx';
import { useEscrituraConectada } from '../hooks/useOperacionesConectadas.js';
import { ErrorApi } from '../services/api.js';

const comprador = { id: '6400000000000000000000a1', rol: 'CLIENTE', nombre: 'Cliente', correo: 'cliente@example.test' };
const ajeno = '6400000000000000000000a2';
const producto = { id: '6600000000000000000000a1', codigo: 'TEST-ACEITE', stock: 2, precio: 5000, precioFinal: 4000 };
const claveCarrito = 'carritoConectadoAutoCare:' + comprador.id;

function guardarSesion(expiraEn = Date.now() + 60000) {
    sessionStorage.setItem(CLAVE_SESION_CONECTADA, JSON.stringify({ token: 'token-ficticio', expiraEn }));
}

function montarSesion(api) {
    return renderHook(useSesionConectada, {
        wrapper: ({ children }) => <SesionConectadaProvider api={api}>{children}</SesionConectadaProvider>
    });
}

async function esperarSesion(result) {
    await waitFor(() => {
        if (result.current.estado !== 'autenticada') throw new Error('Sesión aún no autenticada');
    });
}

describe('Sesión conectada y escrituras protegidas', () => {
    afterEach(() => {
        cleanup();
        sessionStorage.clear();
        localStorage.clear();
    });

    it('una sesión que expiró en almacenamiento se retira antes de consultar la identidad', async () => {
        guardarSesion(Date.now() - 10000);
        const consultarIdentidad = jasmine.createSpy().and.resolveTo(comprador);
        const { result } = montarSesion({ consultarIdentidad });
        await waitFor(() => {
            if (result.current.estado !== 'anonima') throw new Error('Sesión vencida aún presente');
        });
        expect(consultarIdentidad).not.toHaveBeenCalled();
        expect(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).toBeNull();
    });

    it('ofrece reintentar la verificación en caso de red y recupera la ruta protegida', async () => {
        guardarSesion();
        const consultarIdentidad = jasmine.createSpy().and.returnValues(
            Promise.resolve().then(() => { throw new Error('Red interrumpida'); }),
            Promise.resolve(comprador)
        );
        render(<MemoryRouter>
            <SesionConectadaProvider api={{ consultarIdentidad }}>
                <RutaConectada roles={['CLIENTE']}><h1>Área privada</h1></RutaConectada>
            </SesionConectadaProvider>
        </MemoryRouter>);
        expect((await screen.findByRole('alert')).textContent).toContain('No se pudo verificar la sesión conectada.');
        expect(screen.queryByRole('heading', { name: 'Área privada' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Reintentar verificación' }));
        expect(await screen.findByRole('heading', { name: 'Área privada' })).toBeTruthy();
        expect(consultarIdentidad.calls.count()).toBe(2);
    });

    it('rechaza que una cuenta use la sesión de otra y descarta una respuesta tardía tras salir', async () => {
        guardarSesion();
        const { result } = montarSesion({ consultarIdentidad: jasmine.createSpy().and.resolveTo(comprador) });
        await esperarSesion(result);
        const ajena = jasmine.createSpy();
        await expectAsync(result.current.solicitar(ajena, ajeno)).toBeRejectedWith(
            jasmine.objectContaining({ estado: 401 }));
        expect(ajena).not.toHaveBeenCalled();

        let responder;
        const pendiente = result.current.solicitar(() => new Promise((resolver) => { responder = resolver; }), comprador.id);
        const comprobacion = expectAsync(pendiente).toBeRejectedWith(jasmine.objectContaining({ estado: 401 }));
        act(() => result.current.cerrarSesion());
        responder({ orden: 'respuesta tardía' });
        await comprobacion;
        expect(result.current.usuario).toBeNull();
        expect(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).toBeNull();
    });

    it('rechaza una respuesta de login inválida y no guarda una sesión sin Bearer', async () => {
        const consultarIdentidad = jasmine.createSpy();
        const { result } = montarSesion({ consultarIdentidad, iniciarSesion: jasmine.createSpy().and.resolveTo({
            token: 'token-ficticio', tipo: 'Otro', expiraEnSegundos: 3600
        }) });
        await expectAsync(result.current.iniciarSesion({})).toBeRejectedWithError('Respuesta de autenticación inválida.');
        expect(consultarIdentidad).not.toHaveBeenCalled();
        expect(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).toBeNull();
    });

    it('informa errores por campo y bloquea el segundo envío mientras el primero está en curso', async () => {
        const solicitar = jasmine.createSpy().and.callFake((operacion) => operacion(() => 'token-ficticio'));
        const { result } = renderHook(useEscrituraConectada, {
            wrapper: ({ children }) => <SesionConectadaContext.Provider value={{
                usuario: comprador, demostracion: true, escriturasHabilitadas: true, solicitar
            }}>{children}</SesionConectadaContext.Provider>
        });
        let rechazar;
        const guardar = jasmine.createSpy().and.callFake(() => new Promise((_resolver, reject) => { rechazar = reject; }));
        let pendiente;
        act(() => { pendiente = result.current.ejecutar(guardar); });
        expect(result.current.procesando).toBeTrue();
        expect(await result.current.ejecutar(guardar)).toBeFalse();
        expect(guardar.calls.count()).toBe(1);
        await act(async () => {
            rechazar(new ErrorApi('Revisa el formulario.', { estado: 400, campos: { correo: 'Correo inválido.' } }));
            expect(await pendiente).toBeFalse();
        });
        expect(result.current.error).toBe('Revisa el formulario. Correo inválido.');
        expect(result.current.procesando).toBeFalse();
    });

    it('recupera un carrito ilegible, sincroniza solo su clave y respeta el stock máximo', () => {
        localStorage.setItem(claveCarrito, '{incompleto');
        const { result } = renderHook(useCarritoConectado, {
            wrapper: ({ children }) => <SesionConectadaContext.Provider value={{ usuario: comprador }}>
                <CarritoConectadoProvider>{children}</CarritoConectadoProvider>
            </SesionConectadaContext.Provider>
        });
        expect(result.current.cantidadTotal).toBe(0);
        act(() => {
            result.current.agregarProducto({ ...producto, stock: 0 });
            result.current.agregarProducto(producto);
        });
        expect(result.current.cantidadTotal).toBe(1);
        act(() => {
            result.current.agregarProducto(producto);
            result.current.agregarProducto(producto);
            result.current.cambiarCantidad(producto.id, 4, 2);
            result.current.cambiarCantidad(producto.id, 1.5, 2);
        });
        expect(result.current.cantidadTotal).toBe(2);
        localStorage.setItem(claveCarrito, JSON.stringify({ carrito: [] }));
        act(() => { window.dispatchEvent(new StorageEvent('storage', { key: claveCarrito + '-otra' })); });
        expect(result.current.cantidadTotal).toBe(2);
        act(() => { window.dispatchEvent(new StorageEvent('storage', { key: claveCarrito })); });
        expect(result.current.cantidadTotal).toBe(0);
    });

    it('el carrito del vendedor rechaza cambios y no intenta comprar', async () => {
        const solicitar = jasmine.createSpy();
        const { result } = renderHook(useCarritoConectado, {
            wrapper: ({ children }) => <SesionConectadaContext.Provider value={{
                usuario: { ...comprador, rol: 'VENDEDOR' }, solicitar
            }}><CarritoConectadoProvider>{children}</CarritoConectadoProvider></SesionConectadaContext.Provider>
        });
        act(() => result.current.agregarProducto(producto));
        expect(result.current.cantidadTotal).toBe(0);
        await result.current.registrarCompra({ productos: [{ productoId: producto.id, cantidad: 1 }] });
        expect(solicitar).not.toHaveBeenCalled();
        expect(localStorage.getItem(claveCarrito)).toBeNull();
    });
});
