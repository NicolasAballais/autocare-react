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
const entrega = { compradorId: usuario.id, datosCliente: { nombre: 'Cliente de prueba', correo: usuario.correo,
    telefono: '900000000', direccion: 'Calle de prueba', comuna: 'Santiago' }, tipoEntrega: 'Envío estándar' };
const orden = { id: '6700000000000000000000a1', fechaCreacion: '2026-10-19T14:00:00Z',
    estado: 'PROCESANDO', total: 9000, productos: [{ productoId: producto.id, cantidad: 1 }] };
const cliente = { id: usuario.id, nombre: 'Ana', apellido: 'Díaz', correo: 'ana@example.test' };
const incidencia = { id: '6800000000000000000000a1', ordenId: orden.id, fecha: orden.fechaCreacion,
    asunto: 'Seguimiento de entrega', descripcion: 'Consultar itinerario', estado: 'PENDIENTE' };

function montar(ruta, { rol, configuracion = { registro: false, escrituras: false }, estado, escritura, lecturas = {} } = {}) {
    if (rol) sessionStorage.setItem(CLAVE_SESION_CONECTADA, JSON.stringify({
        token: 'bearer-simulado', expiraEn: Date.now() + 60000
    }));
    const red = spyOn(window, 'fetch').and.callFake(async (url, opciones) => {
        if (opciones.method !== 'GET' && escritura) return escritura(url, opciones);
        if (opciones.method !== 'GET') throw new Error('Escritura no prevista.');
        if (url.endsWith('/configuracion')) return Response.json(configuracion);
        if (url.endsWith('/auth/me')) return Response.json({ ...usuario, rol });
        if (Object.hasOwn(lecturas, url)) {
            const datos = lecturas[url];
            return Response.json(typeof datos === 'function' ? datos() : datos);
        }
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

    it('calcula el reporte a partir del catálogo, compras, clientes e incidencias conectadas', async () => {
        const red = montar(`${RUTA_ADMIN_CONECTADA}/reportes`, { rol: 'ADMIN', lecturas: {
            '/api/v1/productos': [{ ...producto, stockCritico: 3 }],
            '/api/v1/ordenes': [orden],
            '/api/v1/usuarios': [cliente],
            '/api/v1/incidencias': [incidencia]
        } });
        expect(await screen.findByText('Total de compras simuladas')).toBeTruthy();
        expect(screen.getAllByText('$9.000').length).toBeGreaterThan(0);
        expect(screen.getByText(producto.nombre)).toBeTruthy();
        for (const url of ['/api/v1/ordenes', '/api/v1/usuarios', '/api/v1/incidencias']) {
            expect(red).toHaveBeenCalledWith(url, jasmine.objectContaining({ method: 'GET',
                headers: jasmine.objectContaining({ Authorization: 'Bearer bearer-simulado' }) }));
        }
    });

    it('usa el catálogo conectado para los avisos de stock crítico', async () => {
        montar(`${RUTA_ADMIN_CONECTADA}/notificaciones`, { rol: 'ADMIN', lecturas: {
            '/api/v1/productos': [{ ...producto, stockCritico: 3 }]
        } });
        expect(await screen.findByText(producto.nombre)).toBeTruthy();
        expect(screen.getByText('Stock crítico: 3')).toBeTruthy();
    });

    it('admin marca una orden enviada y recarga el estado de la API', async () => {
        spyOn(window, 'confirm').and.returnValue(true);
        let estado = 'PROCESANDO';
        const red = montar(`${RUTA_ADMIN_CONECTADA}/ordenes`, { rol: 'ADMIN',
            configuracion: { registro: false, escrituras: true },
            lecturas: { '/api/v1/ordenes': () => [{ ...orden, estado }] },
            escritura: () => { estado = 'ENVIADO'; return new Response(null, { status: 204 }); }
        });
        const enviar = await screen.findByRole('button', { name: 'Marcar enviado' });
        await waitFor(() => { if (enviar.disabled) throw new Error('Las escrituras siguen cerradas.'); });
        fireEvent.click(enviar);
        expect(await screen.findByText('Enviado')).toBeTruthy();
        expect(red).toHaveBeenCalledWith(`/api/v1/ordenes/${orden.id}/envio`, jasmine.objectContaining({ method: 'PUT' }));
    });

    it('admin da de alta un cliente por API y vuelve al listado conectado', async () => {
        const red = montar(`${RUTA_ADMIN_CONECTADA}/usuarios/nuevo`, { rol: 'ADMIN',
            configuracion: { registro: false, escrituras: true },
            lecturas: { '/api/v1/usuarios': [cliente] },
            escritura: () => Response.json(cliente, { status: 201 })
        });
        const crear = await screen.findByRole('button', { name: 'Crear usuario' });
        await waitFor(() => { if (crear.disabled) throw new Error('Las escrituras siguen cerradas.'); });
        for (const [id, value] of Object.entries({ nombre: cliente.nombre, apellido: cliente.apellido,
            correo: cliente.correo, password: 'ClaveFicticia123' })) {
            fireEvent.change(document.getElementById(id), { target: { value } });
        }
        fireEvent.click(crear);
        expect(await screen.findByText(`${cliente.nombre} ${cliente.apellido}`)).toBeTruthy();
        const peticion = red.calls.allArgs().find(([_url, opciones]) => opciones.method === 'POST');
        expect(peticion[0]).toBe('/api/v1/usuarios');
        expect(JSON.parse(peticion[1].body)).toEqual(jasmine.objectContaining({
            contrasena: 'ClaveFicticia123',
            datos: jasmine.objectContaining({ nombre: cliente.nombre, correo: cliente.correo })
        }));
    });

    it('el cliente crea una incidencia para una orden que devuelve su sesión', async () => {
        const red = montar(`${RUTA_CATALOGO_CONECTADO}/incidencias/nueva`, { rol: 'CLIENTE',
            configuracion: { registro: false, escrituras: true },
            lecturas: { '/api/v1/ordenes': [orden], '/api/v1/incidencias': [incidencia] },
            escritura: () => Response.json(incidencia, { status: 201 })
        });
        const enviar = await screen.findByRole('button', { name: 'Enviar incidencia' });
        await waitFor(() => { if (enviar.disabled) throw new Error('Las escrituras siguen cerradas.'); });
        fireEvent.change(screen.getByRole('combobox'), { target: { value: orden.id } });
        fireEvent.change(screen.getByPlaceholderText('Ej: Producto recibido con problemas'),
            { target: { value: incidencia.asunto } });
        fireEvent.change(screen.getByPlaceholderText('Describe el problema con el mayor detalle posible.'),
            { target: { value: incidencia.descripcion } });
        fireEvent.click(enviar);
        expect(await screen.findByText(incidencia.asunto)).toBeTruthy();
        expect(red).toHaveBeenCalledWith('/api/v1/incidencias', jasmine.objectContaining({ method: 'POST',
            body: JSON.stringify({ ordenId: orden.id, asunto: incidencia.asunto, descripcion: incidencia.descripcion }) }));
    });

    it('mantiene cerradas las escrituras administrativas por defecto', async () => {
        const red = montar(`${RUTA_ADMIN_CONECTADA}/ordenes`, { rol: 'ADMIN',
            lecturas: { '/api/v1/ordenes': [orden] } });
        const boton = await screen.findByRole('button', { name: 'Marcar enviado' });
        expect(boton.disabled).toBeTrue();
        fireEvent.click(boton);
        expect(red.calls.allArgs().every(([, opciones]) => opciones.method === 'GET')).toBeTrue();
    });

    it('bloquea a VENDEDOR al navegar directamente a incidencias', async () => {
        const red = montar(`${RUTA_CATALOGO_CONECTADO}/incidencias`, { rol: 'VENDEDOR' });
        expect((await screen.findByRole('alert')).textContent).toContain('Tu rol no tiene permiso');
        expect(red.calls.allArgs().some(([url]) => url === '/api/v1/incidencias')).toBeFalse();
    });

    it('el perfil conectado envía sus cambios al endpoint del usuario autenticado', async () => {
        const red = montar(`${RUTA_CATALOGO_CONECTADO}/perfil`, { rol: 'CLIENTE',
            configuracion: { registro: false, escrituras: true },
            lecturas: { '/api/v1/usuarios/me/perfil': cliente },
            escritura: () => Response.json(cliente)
        });
        const guardar = await screen.findByRole('button', { name: 'Guardar cambios' });
        await waitFor(() => { if (guardar.disabled) throw new Error('La edición sigue cerrada.'); });
        fireEvent.change(screen.getByDisplayValue(cliente.nombre), { target: { value: 'Ana María' } });
        fireEvent.click(guardar);
        expect(await screen.findByText('Perfil actualizado correctamente.')).toBeTruthy();
        expect(red).toHaveBeenCalledWith('/api/v1/usuarios/me/perfil', jasmine.objectContaining({
            method: 'PUT', body: jasmine.stringMatching('"nombre":"Ana María"')
        }));
    });

    it('contacto conectado envía datos validados y no guarda un mensaje simulado', async () => {
        const red = montar(`${RUTA_CATALOGO_CONECTADO}/contacto`, { rol: 'CLIENTE',
            configuracion: { registro: false, escrituras: true },
            escritura: () => new Response(null, { status: 204 })
        });
        const enviar = await screen.findByRole('button', { name: 'Enviar mensaje' });
        await waitFor(() => { if (enviar.disabled) throw new Error('El envío sigue cerrado.'); });
        for (const [id, value] of Object.entries({ nombreContacto: 'Ana', emailContacto: 'ana@gmail.com',
            comentarioContacto: 'Consulta de prueba' })) {
            fireEvent.change(document.getElementById(id), { target: { value } });
        }
        fireEvent.click(enviar);
        expect(await screen.findByText('Tu mensaje fue enviado correctamente.')).toBeTruthy();
        expect(red).toHaveBeenCalledWith('/api/v1/contacto', jasmine.objectContaining({ method: 'POST' }));
        expect(localStorage.getItem('mensajesContactoAutoCare')).toBeNull();
    });
});
