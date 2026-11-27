import { actualizarCategoria, eliminarCategoria, guardarCategoria, obtenerCategorias } from '../services/categoriasService';
import { actualizarEstadoIncidencia, guardarIncidencia, incidenciaPerteneceAUsuario,
    obtenerIncidencias, obtenerIncidenciasUsuario } from '../services/incidenciasService';
import { actualizarEstadoOrden, guardarOrden, obtenerOrdenes, obtenerOrdenesUsuario } from '../services/ordenesService';
import { guardarProductos, obtenerProductos } from '../services/productosService';
import { actualizarUsuarioAdmin, actualizarUsuarioPerfil, cerrarSesion, iniciarSesion, obtenerClientes, obtenerSesion,
    obtenerUsuarioPorId, registrarUsuario } from '../services/usuariosService';

const cliente = { id: 21, nombre: 'Rosa', apellido: 'Pérez', correo: 'rosa@example.test', rol: 'cliente' };
const otro = { id: 22, nombre: 'Luis', apellido: 'Díaz', correo: 'luis@example.test', rol: 'cliente' };
const admin = { id: 99, rol: 'admin', correo: 'admin@example.test' };
const sesion = (usuario) => localStorage.setItem('sesionAutoCare', JSON.stringify(usuario));

describe('Reglas del simulador local', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => localStorage.clear());

    it('renombra la categoría con sus productos y rechaza borrarla mientras siga asociada', () => {
        localStorage.setItem('categoriasAutoCare', JSON.stringify([{ id: 1, nombre: 'Filtros' }, { id: 2, nombre: 'Aceites' }]));
        guardarProductos([{ id: 6, nombre: 'Filtro de prueba', categoria: 'Filtros' },
            { id: 7, nombre: 'Aceite de prueba', categoria: 'Aceites' }]);

        expect(guardarCategoria(' ')).toEqual(jasmine.objectContaining({ exito: false, mensaje: jasmine.stringMatching(/obligatorio/) }));
        expect(guardarCategoria(' FILTROS ').exito).toBeFalse();
        expect(actualizarCategoria(90, 'Nueva').exito).toBeFalse();
        expect(actualizarCategoria(1, '').exito).toBeFalse();
        expect(actualizarCategoria(1, 'aceites').exito).toBeFalse();
        expect(actualizarCategoria('1', ' Filtros nuevos ')).toEqual({ exito: true });
        expect(obtenerProductos().map((producto) => producto.categoria)).toEqual(['Filtros nuevos', 'Aceites']);
        expect(eliminarCategoria(1)).toEqual(jasmine.objectContaining({ exito: false, mensaje: jasmine.stringMatching(/asociados/) }));
        expect(eliminarCategoria(99).exito).toBeFalse();
        const { categoria } = guardarCategoria('Accesorios');
        expect(obtenerCategorias().map((elemento) => elemento.nombre)).toContain('Accesorios');
        expect(eliminarCategoria(categoria.id).exito).toBeTrue();
        expect(obtenerCategorias().map((elemento) => elemento.nombre)).not.toContain('Accesorios');
    });

    it('atribuye la incidencia a su comprador, conserva órdenes antiguas y registra la resolución', () => {
        localStorage.setItem('ordenesAutoCare', JSON.stringify([
            { id: 99, usuarioId: null, cliente: { correo: ' ROSA@example.test ' }, estado: 'Procesando' }
        ]));
        const entrada = { ordenId: 99, asunto: 'Despacho', descripcion: 'Consulta ficticia' };
        expect(incidenciaPerteneceAUsuario(entrada, null)).toBeFalse();
        expect(incidenciaPerteneceAUsuario(entrada, admin)).toBeTrue();
        expect(incidenciaPerteneceAUsuario({ ...entrada, ordenId: 500 }, cliente)).toBeFalse();
        expect(incidenciaPerteneceAUsuario(entrada, cliente)).toBeTrue();
        expect(incidenciaPerteneceAUsuario(entrada, otro)).toBeFalse();

        const iniciales = obtenerIncidencias();
        expect(obtenerIncidencias()).toEqual(iniciales);
        localStorage.setItem('incidenciasAutoCare', '[]');
        sesion(cliente);
        const creada = guardarIncidencia(entrada);
        expect(creada).toEqual(jasmine.objectContaining({ usuarioId: cliente.id, usuarioCorreo: cliente.correo, estado: 'Pendiente' }));
        expect(obtenerIncidenciasUsuario(cliente)).toEqual([creada]);
        expect(obtenerIncidenciasUsuario(otro)).toEqual([]);
        actualizarEstadoIncidencia(String(creada.id), 'Resuelta');
        expect(obtenerIncidenciasUsuario(admin)[0].estado).toBe('Resuelta');
    });

    it('lee incidencias y órdenes de invitado solo con la referencia histórica disponible', () => {
        localStorage.setItem('ordenesAutoCare', '[]');
        localStorage.setItem('incidenciasAutoCare', '[]');
        const orden = guardarOrden({ cliente: { correo: cliente.correo } });
        expect(orden.usuarioId).toBeNull();
        expect(obtenerOrdenesUsuario(null)).toEqual([]);
        expect(obtenerOrdenesUsuario(cliente)).toEqual([orden]);
        expect(obtenerOrdenesUsuario(admin)).toHaveSize(1);
        const incidencia = guardarIncidencia({ ordenId: orden.id, asunto: 'Consulta invitada' });
        expect(incidencia.usuarioId).toBeNull();
        expect(obtenerIncidenciasUsuario(cliente)).toHaveSize(1);
        expect(obtenerIncidenciasUsuario(otro)).toEqual([]);
        actualizarEstadoOrden(orden.id, 'Enviado');
        expect(obtenerOrdenes()[0].estado).toBe('Enviado');
        actualizarEstadoIncidencia(12, 'Resuelta');
        expect(obtenerIncidencias()[0].estado).toBe('Pendiente');
    });

    it('migra la clave local anterior a hash y retira credenciales de la sesión', async () => {
        const clave = 'ClaveTest1';
        localStorage.setItem('usuariosAutoCare', JSON.stringify([{ ...cliente, password: clave }, admin]));
        expect(await iniciarSesion('ROSA@example.test', 'no coincide')).toEqual(jasmine.objectContaining({ exito: false }));
        expect(obtenerSesion()).toBeNull();
        expect((await iniciarSesion('ROSA@example.test', clave)).usuario).toEqual(cliente);
        const guardado = obtenerUsuarioPorId(cliente.id);
        expect(guardado.password).toBeUndefined();
        expect(guardado.hashLocal).toMatch(/^[0-9a-f]{64}$/);
        expect(guardado.salLocal).toHaveSize(16);
        expect(obtenerClientes()).toEqual([guardado]);
        sesion({ ...cliente, password: clave, hashLocal: guardado.hashLocal });
        expect(obtenerSesion()).toEqual(cliente);
        expect(localStorage.getItem('sesionAutoCare')).not.toContain(clave);
        cerrarSesion();
        expect(obtenerSesion()).toBeNull();
    });

    it('edita cuentas locales con correo único y mantiene perfil y sesión coherentes', async () => {
        localStorage.setItem('usuariosAutoCare', JSON.stringify([cliente, otro]));
        sesion(cliente);
        const datos = { nombre: ' Rosa María ', apellido: ' Pérez ', correo: ' ROSA@example.test ',
            telefono: ' 900000000 ', comuna: ' Santiago ', direccion: ' Avenida local ' };
        expect((await actualizarUsuarioAdmin(99, datos)).exito).toBeFalse();
        expect((await actualizarUsuarioAdmin(cliente.id, { ...datos, correo: ' LUIS@example.test ' })).exito).toBeFalse();
        const edicion = await actualizarUsuarioAdmin(String(cliente.id), datos);
        expect(edicion.usuario).toEqual(jasmine.objectContaining({
            nombre: 'Rosa María', correo: 'ROSA@example.test', telefono: '900000000', comuna: 'Santiago'
        }));
        expect(obtenerSesion()).toEqual(edicion.usuario);
        expect(obtenerUsuarioPorId(otro.id)).toEqual(otro);
        expect(await actualizarUsuarioPerfil(cliente.id, { comuna: 'Maipú' }))
            .toEqual(jasmine.objectContaining({ comuna: 'Maipú' }));
        expect(obtenerSesion().comuna).toBe('Maipú');
        cerrarSesion();
        expect(await actualizarUsuarioPerfil(999, {})).toBeUndefined();
        expect((await actualizarUsuarioAdmin(otro.id, { nombre: otro.nombre, apellido: otro.apellido, correo: otro.correo })).exito)
            .toBeTrue();
        expect(await registrarUsuario({ ...cliente, password: 'ClaveTest1' })).toEqual(jasmine.objectContaining({ exito: false }));
    });
});
