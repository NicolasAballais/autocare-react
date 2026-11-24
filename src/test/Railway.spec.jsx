import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../App.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import SesionConectadaProvider from '../context/SesionConectadaProvider.jsx';
import { CLAVE_SESION_CONECTADA } from '../context/sesionConectada.js';
import { RUTA_ADMIN_CONECTADA, RUTA_CATALOGO_CONECTADO, RUTA_COMPRA_CONECTADA,
    RUTA_LOGIN_CONECTADO, RUTA_REGISTRO_CONECTADO } from '../context/catalogo.js';
import { lineaCarritoConectado } from '../services/carritoService.js';

const usuario = { id: '6400000000000000000000a1', nombre: 'Cuenta de prueba', correo: 'cuenta@example.test' };
const producto = { id: '6600000000000000000000a1', codigo: 'ACE001', nombre: 'Aceite de prueba',
    categoria: 'Aceites', categoriaId: '6500000000000000000000a1', precio: 10000, precioFinal: 9000, descuento: 10, stock: 3 };
const entrega = { compradorId: usuario.id, datosCliente: { nombre: 'Cliente de prueba' }, tipoEntrega: 'Envío estándar' };

function montar(ruta, { rol, configuracion = { registro: false, escrituras: false }, estado, escritura } = {}) {
    if (rol) sessionStorage.setItem(CLAVE_SESION_CONECTADA, JSON.stringify({
        token: 'bearer-simulado', expiraEn: Date.now() + 60000
    }));
    const red = spyOn(window, 'fetch').and.callFake(async (url, opciones) => {
        if (opciones.method !== 'GET' && escritura) return escritura(url, opciones);
        if (opciones.method !== 'GET') throw new Error('Escritura no prevista.');
        if (url.endsWith('/configuracion')) return Response.json(configuracion);
        if (url.endsWith('/auth/me')) return Response.json({ ...usuario, rol });
        if (url.endsWith('/productos')) return Response.json([producto]);
        if (url.endsWith('/categorias')) return Response.json([{ id: producto.categoriaId, nombre: producto.categoria }]);
        throw new Error('Ruta no prevista en la demostración simulada.');
    });
    window.history.replaceState(estado ? { usr: estado, key: 'prueba', idx: 0 } : null, '', ruta);
    render(<SesionConectadaProvider demostracion><CarritoProvider><App /></CarritoProvider></SesionConectadaProvider>);
    return red;
}

describe('Demostración Railway', () => {
    let urlAnterior;
    let estadoAnterior;
    beforeEach(() => {
        urlAnterior = window.location.href;
        estadoAnterior = window.history.state;
        localStorage.clear();
        sessionStorage.clear();
    });
    afterEach(() => {
        cleanup();
        window.history.replaceState(estadoAnterior, '', urlAnterior);
        localStorage.clear();
        sessionStorage.clear();
    });

    it('redirige rutas simuladas al catálogo conectado', async () => {
        montar('/admin');
        expect(await screen.findByText(producto.nombre)).toBeTruthy();
        expect(window.location.pathname).toBe(RUTA_CATALOGO_CONECTADO);
        expect(screen.queryByRole('link', { name: 'Volver al catálogo local' })).toBeNull();
    });

    it('permite el login y mantiene el registro cerrado ante una configuración ambigua', async () => {
        const red = montar(RUTA_REGISTRO_CONECTADO, { configuracion: { registro: 'true', escrituras: null } });
        await screen.findByText('El registro conectado está deshabilitado.');
        const boton = screen.getByRole('button', { name: 'Crear cuenta' });
        expect(boton.disabled).toBeTrue();
        fireEvent.click(boton);
        expect(red.calls.allArgs().every(([, opciones]) => opciones.method === 'GET')).toBeTrue();
        fireEvent.click(screen.getByRole('link', { name: 'Iniciar Sesión' }));
        expect(window.location.pathname).toBe(RUTA_LOGIN_CONECTADO);
        expect(screen.getByRole('button', { name: 'Ingresar' }).disabled).toBeFalse();
    });

    it('permite el registro normal cuando el servidor lo habilita', async () => {
        const red = montar(RUTA_REGISTRO_CONECTADO, {
            configuracion: { registro: true, escrituras: false },
            escritura: () => Response.json({}, { status: 201 })
        });
        const boton = screen.getByRole('button', { name: 'Crear cuenta' });
        await waitFor(() => {
            if (boton.disabled) throw new Error('El registro sigue cerrado.');
        });
        for (const [etiqueta, value] of Object.entries({
            Nombre: 'Ana', Apellido: 'Prueba', 'Correo electrónico': 'ana@example.test',
            Contraseña: 'ClaveSimulada', 'Confirmar contraseña': 'ClaveSimulada'
        })) fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } });
        fireEvent.click(boton);
        expect(await screen.findByText(/Cuenta creada/)).toBeTruthy();
        expect(red).toHaveBeenCalledWith('/api/v1/auth/registro', jasmine.objectContaining({ method: 'POST' }));
    });

    for (const escrituras of [false, true]) {
        it(`aplica la configuración de compras (escrituras ${escrituras}) sin exigir TEST-`, async () => {
            localStorage.setItem(`carritoConectadoAutoCare:${usuario.id}`, JSON.stringify({
                carrito: [lineaCarritoConectado(producto, 1)], compradorId: usuario.id
            }));
            const red = montar(RUTA_COMPRA_CONECTADA, { rol: 'CLIENTE', estado: entrega,
                configuracion: { registro: false, escrituras },
                escritura: (_url, opciones) => Response.json({ id: opciones.headers['Idempotency-Key'],
                    estado: 'PROCESANDO', total: 9000, productos: [
                        { productoId: producto.id, nombre: producto.nombre, cantidad: 1 }
                    ] }, { status: 201 })
            });
            const boton = await screen.findByRole('button', { name: 'Confirmar compra' });
            await waitFor(() => {
                if (boton.disabled === escrituras) throw new Error('El botón aún no refleja la configuración.');
            });
            fireEvent.click(boton);
            if (escrituras) {
                expect(await screen.findByRole('heading', { name: 'Orden confirmada' })).toBeTruthy();
                expect(red).toHaveBeenCalledWith('/api/v1/ordenes', jasmine.objectContaining({
                    method: 'POST',
                    headers: jasmine.objectContaining({ Authorization: 'Bearer bearer-simulado',
                        'Idempotency-Key': jasmine.stringMatching(/^[a-f0-9]{24}$/) })
                }));
            } else {
                expect(red.calls.allArgs().every(([, opciones]) => opciones.method === 'GET')).toBeTrue();
            }
        });
    }

    it('permite edición de un producto normal únicamente con el modo administrativo habilitado', async () => {
        montar(`${RUTA_ADMIN_CONECTADA}/productos`, {
            rol: 'ADMIN', configuracion: { registro: false, escrituras: true }
        });
        expect(await screen.findByRole('link', { name: 'Editar' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Nuevo producto' })).toBeTruthy();
        expect(screen.queryByText(/registros temporales autorizados/)).toBeNull();
    });
});
