import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import RutaConectada from '../components/RutaConectada.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import SesionConectadaProvider from '../context/SesionConectadaProvider.jsx';
import { CLAVE_SESION_CONECTADA, useSesionConectada } from '../context/sesionConectada.js';
import { RUTA_ADMIN_CONECTADA, RUTA_CATALOGO_CONECTADO, RUTA_CHECKOUT_CONECTADO, RUTA_LOGIN_CONECTADO,
    RUTA_ORDENES_CONECTADAS, RUTA_REGISTRO_CONECTADO } from '../context/catalogo.js';
import CatalogoConectado from '../pages/CatalogoConectado.jsx';
import Login from '../pages/Login.jsx';
import OrdenesConectadas from '../pages/OrdenesConectadas.jsx';
import Productos from '../pages/Productos.jsx';
import Register from '../pages/Register.jsx';
import { authApi, crearClienteAuth } from '../services/authApi.js';
import { obtenerJsonApi } from '../services/api.js';
import { iniciarSesion, obtenerSesion, registrarUsuario } from '../services/usuariosService.js';

const USUARIO = { id: '6400000000000000000000a1', nombre: 'Ana Prueba', correo: 'ana@example.test', rol: 'CLIENTE' };
const TOKEN = 'token-simulado';
const CLAVE_LOCAL = 'sesionAutoCare';
const CONTRASENA = 'ClaveSimulada1';
const DATOS_REGISTRO = { Nombre: 'Ana', Apellido: 'Prueba', 'Correo electrónico': USUARIO.correo,
    Contraseña: 'Clave123', 'Confirmar contraseña': 'Clave123' };
const clienteAuth = crearClienteAuth({ habilitado: true });
const json = (datos, status = 200) => Response.json(datos, { status });

function guardarSesion(cambios = {}) {
    sessionStorage.setItem(CLAVE_SESION_CONECTADA, JSON.stringify({
        token: TOKEN, expiraEn: Date.now() + 60000, ...cambios
    }));
}

function VistaSesion() {
    const { usuario, solicitar } = useSesionConectada();
    return <main>
        <h1>Perfil de {usuario.rol}</h1>
        <button type="button" onClick={() => solicitar((token) => obtenerJsonApi('/ordenes', {
            cabeceras: { Authorization: `Bearer ${token()}` }
        }), usuario.id).catch(() => {})}>Consultar recurso protegido</button>
    </main>;
}

function montar(ruta, habilitado = true) {
    return render(
        <MemoryRouter initialEntries={[ruta]}>
            <SesionConectadaProvider api={habilitado ? clienteAuth : authApi} habilitado={habilitado}>
                <CarritoProvider>
                    <Navbar />
                    <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path={RUTA_LOGIN_CONECTADO} element={<Login conectado />} />
                        <Route path={RUTA_REGISTRO_CONECTADO} element={<Register conectado />} />
                        <Route path={RUTA_CATALOGO_CONECTADO} element={<CatalogoConectado />}>
                            <Route index element={<Productos />} />
                        </Route>
                        <Route element={<RutaConectada />}>
                            <Route path={`${RUTA_CATALOGO_CONECTADO}/perfil`} element={<VistaSesion />} />
                            <Route path={RUTA_ORDENES_CONECTADAS} element={<OrdenesConectadas />} />
                            <Route path={`${RUTA_ORDENES_CONECTADAS}/:id`} element={<OrdenesConectadas />} />
                        </Route>
                        <Route path={RUTA_ADMIN_CONECTADA}
                            element={<RutaConectada roles={['ADMIN']}><h1>Panel protegido</h1></RutaConectada>} />
                        <Route path={RUTA_CHECKOUT_CONECTADO}
                            element={<RutaConectada roles={['ADMIN', 'CLIENTE']}><h1>Checkout protegido</h1></RutaConectada>} />
                    </Routes>
                </CarritoProvider>
            </SesionConectadaProvider>
        </MemoryRouter>
    );
}

function escribir(campos) {
    for (const [etiqueta, value] of Object.entries(campos)) {
        fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } });
    }
}

function ingresar() {
    escribir({ 'Correo Electrónico': USUARIO.correo, Contraseña: CONTRASENA });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
}

describe('Autenticación conectada', () => {
    beforeEach(() => { sessionStorage.clear(); localStorage.clear(); });
    afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });

    for (const [modo, ruta, longitud] of [['local', '/register', 4], ['conectado', RUTA_REGISTRO_CONECTADO, 8]]) {
        it(`bloquea el registro ${modo} con campos vacíos o correo inválido`, () => {
            const fetchSimulado = spyOn(window, 'fetch');
            montar(ruta);
            const enviar = screen.getByRole('button', { name: 'Crear cuenta' });
            const nombre = screen.getByLabelText('Nombre');
            expect(nombre.validity.valueMissing).toBeTrue();
            fireEvent.click(enviar);
            expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeTruthy();

            escribir({ ...DATOS_REGISTRO, 'Correo electrónico': 'correo-invalido' });
            expect(screen.getByLabelText('Correo electrónico').validity.typeMismatch).toBeTrue();
            fireEvent.click(enviar);
            expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeTruthy();
            expect(localStorage.getItem('usuariosAutoCare')).toBeNull();
            expect(fetchSimulado).not.toHaveBeenCalled();
        });

        it(`muestra la longitud mínima y la confirmación de contraseña en registro ${modo}`, () => {
            const fetchSimulado = spyOn(window, 'fetch');
            montar(ruta);
            escribir({ ...DATOS_REGISTRO, Contraseña: 'abc', 'Confirmar contraseña': 'abc' });
            // Dispara el controlador para probar su validación además de la nativa.
            const formulario = screen.getByRole('button', { name: 'Crear cuenta' }).form;
            fireEvent.submit(formulario);
            expect(screen.getByRole('alert').textContent).toContain(`entre ${longitud} y`);

            escribir({ ...DATOS_REGISTRO, Contraseña: '        ', 'Confirmar contraseña': '        ' });
            fireEvent.submit(formulario);
            expect(screen.getByRole('alert').textContent).toContain(`entre ${longitud} y`);

            escribir({ ...DATOS_REGISTRO, 'Confirmar contraseña': 'Clave456' });
            fireEvent.submit(formulario);
            expect(screen.getByRole('alert').textContent).toContain('Las contraseñas no coinciden');
            expect(localStorage.getItem('usuariosAutoCare')).toBeNull();
            expect(fetchSimulado).not.toHaveBeenCalled();
        });
    }

    it('rechaza el correo local duplicado aunque cambie el uso de mayúsculas', async () => {
        const guardados = JSON.stringify([{ id: 1, correo: USUARIO.correo }]);
        localStorage.setItem('usuariosAutoCare', guardados);
        const fetchSimulado = spyOn(window, 'fetch');
        montar('/register');
        escribir({ ...DATOS_REGISTRO, 'Correo electrónico': USUARIO.correo.toUpperCase() });
        fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
        expect((await screen.findByRole('alert')).textContent).toMatch(/ya existe.*correo/i);
        expect(localStorage.getItem('usuariosAutoCare')).toBe(guardados);
        expect(fetchSimulado).not.toHaveBeenCalled();
    });

    it('informa el 409 de correo duplicado en el registro conectado', async () => {
        const fetchSimulado = spyOn(window, 'fetch').and.resolveTo(json({}, 409));
        montar(RUTA_REGISTRO_CONECTADO);
        escribir(DATOS_REGISTRO);
        fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
        expect((await screen.findByRole('alert')).textContent).toContain('Ya existe una cuenta con ese correo');
        expect(fetchSimulado).toHaveBeenCalledOnceWith('/api/v1/auth/registro', jasmine.objectContaining({ method: 'POST' }));
        expect(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).toBeNull();
    });

    it('registra un CLIENTE y envía únicamente los campos del DTO', async () => {
        const fetchSimulado = spyOn(window, 'fetch').and.resolveTo(json(USUARIO, 201));
        montar(RUTA_REGISTRO_CONECTADO);
        expect(screen.queryByRole('combobox')).toBeNull();
        escribir({
            Nombre: 'Ana', Apellido: 'Prueba', 'Correo electrónico': USUARIO.correo,
            Contraseña: CONTRASENA, 'Confirmar contraseña': CONTRASENA
        });
        fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
        expect(await screen.findByText('Cuenta creada. Ingresa con tus datos.')).toBeTruthy();

        const [ruta, opciones] = fetchSimulado.calls.mostRecent().args;
        expect(ruta).toBe('/api/v1/auth/registro');
        expect(JSON.parse(opciones.body)).toEqual({
            nombre: USUARIO.nombre, correo: USUARIO.correo, contrasena: CONTRASENA
        });
        expect(opciones.headers.Authorization).toBeUndefined();
        expect(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).toBeNull();
        expect(localStorage.getItem('usuariosAutoCare')).toBeNull();
    });

    it('inicia sesión, comprueba /me y solo guarda el token y vencimiento', async () => {
        const fetchSimulado = spyOn(window, 'fetch').and.callFake(async (ruta, opciones) => {
            if (ruta.endsWith('/login')) return json({ tipo: 'Bearer', token: TOKEN, expiraEnSegundos: 1800,
                usuario: { ...USUARIO, rol: 'ADMIN' } });
            if (ruta.endsWith('/me') && opciones.headers.Authorization === `Bearer ${TOKEN}`) return json(USUARIO);
            if (ruta.endsWith('/productos') || ruta.endsWith('/categorias')) {
                expect(opciones.headers.Authorization).toBeUndefined();
                return json([]);
            }
            throw new Error('Solicitud no prevista');
        });
        montar(RUTA_LOGIN_CONECTADO);
        ingresar();
        expect(await screen.findByRole('button', { name: 'Cerrar sesión' })).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'Administración' })).toBeNull();
        const [ruta, opciones] = fetchSimulado.calls.first().args;
        expect(ruta).toBe('/api/v1/auth/login');
        expect(opciones.headers.Authorization).toBeUndefined();
        expect(JSON.parse(opciones.body)).toEqual({ correo: USUARIO.correo, contrasena: CONTRASENA });
        const guardada = JSON.parse(sessionStorage.getItem(CLAVE_SESION_CONECTADA));
        expect(guardada).toEqual({ token: TOKEN, expiraEn: jasmine.any(Number) });
        expect(localStorage.getItem(CLAVE_LOCAL)).toBeNull();
    });

    it('muestra credenciales incorrectas sin reutilizar la sesión local', async () => {
        const local = JSON.stringify({ id: 1, nombre: 'Admin local', rol: 'admin' });
        localStorage.setItem(CLAVE_LOCAL, local);
        const fetchSimulado = spyOn(window, 'fetch').and.resolveTo(json({ detail: 'Error de prueba' }, 401));
        montar(RUTA_LOGIN_CONECTADO);
        ingresar();
        expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'Administración' })).toBeNull();
        expect(fetchSimulado.calls.count()).toBe(1);
        expect(localStorage.getItem(CLAVE_LOCAL)).toBe(local);
        expect(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).toBeNull();
    });

    it('recupera la identidad con /me y descarta un rol editado en el navegador', async () => {
        guardarSesion({ rol: 'ADMIN', usuario: { ...USUARIO, rol: 'ADMIN' } });
        const fetchSimulado = spyOn(window, 'fetch').and.resolveTo(json(USUARIO));
        montar(RUTA_ADMIN_CONECTADA);
        expect(await screen.findByText(/Tu rol no tiene permiso/)).toBeTruthy();
        expect(screen.queryByRole('heading', { name: 'Panel protegido' })).toBeNull();
        expect(fetchSimulado).toHaveBeenCalledOnceWith('/api/v1/auth/me', jasmine.objectContaining({
            method: 'GET', headers: jasmine.objectContaining({ Authorization: `Bearer ${TOKEN}` })
        }));
    });

    it('cierra la sesión conectada y conserva la sesión y el carrito local', async () => {
        localStorage.setItem(CLAVE_LOCAL, JSON.stringify({ id: 1, nombre: 'Local', rol: 'cliente' }));
        localStorage.setItem('carritoAutoCare', '[{"id":1,"cantidad":2}]');
        guardarSesion();
        spyOn(window, 'fetch').and.callFake(async (ruta) => json(ruta.endsWith('/me') ? USUARIO : []));
        montar(`${RUTA_CATALOGO_CONECTADO}/perfil`);
        await screen.findByRole('heading', { name: 'Perfil de CLIENTE' });
        fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
        expect(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).toBeNull();
        expect(obtenerSesion().nombre).toBe('Local');
        expect(localStorage.getItem('carritoAutoCare')).toBe('[{"id":1,"cantidad":2}]');
    });

    it('descarta una sesión ya vencida sin consultar el backend', async () => {
        guardarSesion({ expiraEn: Date.now() - 1000 });
        const fetchSimulado = spyOn(window, 'fetch');
        montar(RUTA_ADMIN_CONECTADA);
        expect(await screen.findByRole('heading', { name: 'Iniciar sesión conectada' })).toBeTruthy();
        expect(fetchSimulado).not.toHaveBeenCalled();
        expect(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).toBeNull();
    });

    it('conserva la sesión ante 403 y la cierra ante 401 en una ruta protegida', async () => {
        guardarSesion();
        let estado = 403;
        const fetchSimulado = spyOn(window, 'fetch').and.callFake(async (ruta) =>
            ruta.endsWith('/me') ? json(USUARIO) : json({}, estado));
        montar(`${RUTA_CATALOGO_CONECTADO}/perfil`);
        const consultar = await screen.findByRole('button', { name: 'Consultar recurso protegido' });
        fireEvent.click(consultar);
        await waitFor(() => {
            if (fetchSimulado.calls.count() !== 2) throw new Error('Consulta pendiente.');
        });
        expect(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).not.toBeNull();

        estado = 401;
        fireEvent.click(consultar);
        expect(await screen.findByRole('heading', { name: 'Iniciar sesión conectada' })).toBeTruthy();
        expect(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).toBeNull();
    });

    it('ignora el 401 tardío de una solicitud de la cuenta anterior', async () => {
        guardarSesion();
        const otraCuenta = { ...USUARIO, id: '6400000000000000000000a2', nombre: 'Otra cuenta' };
        const segundoToken = 'otro-token-simulado';
        let responder;
        spyOn(window, 'fetch').and.callFake(async (ruta, opciones) => {
            if (ruta.endsWith('/me')) return json(opciones.headers.Authorization === `Bearer ${TOKEN}` ? USUARIO : otraCuenta);
            if (ruta.endsWith('/ordenes')) return new Promise((resolver) => { responder = resolver; });
            if (ruta.endsWith('/login')) return json({ tipo: 'Bearer', token: segundoToken, expiraEnSegundos: 1800 });
            return json([]);
        });
        montar(`${RUTA_CATALOGO_CONECTADO}/perfil`);
        fireEvent.click(await screen.findByRole('button', { name: 'Consultar recurso protegido' }));
        fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
        fireEvent.click(screen.getByRole('link', { name: 'Iniciar Sesión' }));
        ingresar();
        expect(await screen.findByRole('link', { name: 'Otra cuenta' })).toBeTruthy();

        await act(async () => { responder(json({}, 401)); });
        expect(screen.getByRole('link', { name: 'Otra cuenta' })).toBeTruthy();
        expect(JSON.parse(sessionStorage.getItem(CLAVE_SESION_CONECTADA)).token).toBe(segundoToken);
    });

    for (const [rol, ruta, titulo] of [
        ['ADMIN', RUTA_ADMIN_CONECTADA, 'Panel protegido'],
        ['CLIENTE', RUTA_CHECKOUT_CONECTADO, 'Checkout protegido'],
        ['VENDEDOR', RUTA_ORDENES_CONECTADAS, 'Órdenes conectadas']
    ]) {
        it(`habilita la ruta correspondiente al rol ${rol} validado por /me`, async () => {
            guardarSesion();
            spyOn(window, 'fetch').and.callFake(async (url) => json(url.endsWith('/me') ? { ...USUARIO, rol } : []));
            montar(ruta);
            expect(await screen.findByRole('heading', { name: titulo })).toBeTruthy();
        });
    }

    it('mantiene el catálogo del vendedor sin botones de compra y oculta la administración', async () => {
        guardarSesion();
        const producto = { id: '6600000000000000000000a1', codigo: 'ACE001', nombre: 'Aceite visible',
            precio: 35000, precioFinal: 28000, descuento: 20, stock: 3 };
        spyOn(window, 'fetch').and.callFake(async (ruta) => json(ruta.endsWith('/me') ?
            { ...USUARIO, rol: 'VENDEDOR' } : ruta.endsWith('/productos') ? [producto] : []));
        montar(RUTA_CATALOGO_CONECTADO);
        await screen.findByRole('button', { name: 'Cerrar sesión' });
        expect(await screen.findByText(producto.nombre)).toBeTruthy();
        expect(screen.queryByRole('button', { name: /Agregar.*al carrito conectado/ })).toBeNull();
        expect(screen.queryByRole('link', { name: 'Carrito conectado' })).toBeNull();
        expect(screen.queryByRole('link', { name: 'Administración' })).toBeNull();
        expect(screen.getByRole('link', { name: 'Órdenes' }).getAttribute('href')).toBe(RUTA_ORDENES_CONECTADAS);
    });

    it('solicita las órdenes propias y muestra el 404 para una orden ajena', async () => {
        guardarSesion();
        const idPropio = '6700000000000000000000a1';
        const idAjeno = '6700000000000000000000a2';
        const fetchSimulado = spyOn(window, 'fetch').and.callFake(async (ruta) => {
            if (ruta.endsWith('/me')) return json(USUARIO);
            if (ruta.endsWith('/ordenes')) return json([{ id: idPropio, total: 25000, estado: 'PROCESANDO' }]);
            return json({}, 404);
        });
        const vista = montar(RUTA_ORDENES_CONECTADAS);
        expect(await screen.findByRole('link', { name: `Orden ${idPropio}` })).toBeTruthy();
        expect(screen.queryByRole('link', { name: `Orden ${idAjeno}` })).toBeNull();
        vista.unmount();
        montar(`${RUTA_ORDENES_CONECTADAS}/${idAjeno}`);
        expect((await screen.findByRole('alert')).textContent).toContain('Orden no encontrada');
        expect(fetchSimulado).toHaveBeenCalledWith(`/api/v1/ordenes/${idAjeno}`, jasmine.objectContaining({
            headers: jasmine.objectContaining({ Authorization: `Bearer ${TOKEN}` })
        }));
    });

    it('bloquea por defecto los POST de login y registro en el formulario y cliente', async () => {
        const fetchSimulado = spyOn(window, 'fetch');
        montar(RUTA_LOGIN_CONECTADO, false);
        expect(screen.getByRole('button', { name: 'Ingresar' }).disabled).toBeTrue();
        await expectAsync(authApi.iniciarSesion({})).toBeRejectedWithError(/deshabilitadas/);
        await expectAsync(authApi.registrar({})).toBeRejectedWithError(/deshabilitadas/);
        expect(fetchSimulado).not.toHaveBeenCalled();
    });

    it('permite registrar e iniciar una cuenta local sin persistir la contraseña', async () => {
        const fetchSimulado = spyOn(window, 'fetch');
        expect((await registrarUsuario({ nombre: USUARIO.nombre, correo: USUARIO.correo, password: CONTRASENA })).exito)
            .toBeTrue();
        expect((await iniciarSesion(USUARIO.correo, 'incorrecta')).exito).toBeFalse();
        expect((await iniciarSesion(USUARIO.correo, CONTRASENA)).exito).toBeTrue();
        expect(obtenerSesion().rol).toBe('cliente');
        expect(localStorage.getItem('usuariosAutoCare')).not.toContain(CONTRASENA);
        expect(localStorage.getItem(CLAVE_LOCAL)).not.toContain('hashLocal');
        expect(localStorage.getItem(CLAVE_LOCAL)).not.toContain('password');
        expect(fetchSimulado).not.toHaveBeenCalled();
    });
});
