import { enviarJsonApi, ErrorApi } from '../services/api.js';
import { cabeceraBearer, validarIdentidad } from '../services/authApi.js';
import { prepararCarritoConectado } from '../services/carritoService.js';
import { crearEnvioOrden, prepararSolicitudOrden, solicitudDelIntento, validarOrdenConfirmada } from '../services/ordenesApi.js';
import { editarClienteApi, formatearRegistro, listarOrdenesClienteApi, obtenerClienteApi,
    resolverIncidenciaApi } from '../services/operacionesApi.js';
import { cargarConfiguracionAdmin, configuracionAdminLocal } from '../services/adminCatalogoConfiguracion.js';

const ID = '6600000000000000000000a1';
const ORDEN = '6700000000000000000000a1';
const solicitud = { productos: [{ productoId: ID, cantidad: 2 }] };
const entrega = { nombre: 'Nombre de prueba', correo: 'cliente@example.test', telefono: '900000000',
    comuna: 'Santiago', direccion: 'Calle de prueba', tipo: 'Envío estándar' };
const intento = (cuerpo) => ({ id: ORDEN, cuerpo: JSON.stringify(cuerpo) });
const token = () => 'token-ficticio';

describe('Contratos REST de órdenes y operaciones', () => {
    it('rechaza cantidades fuera del contrato y productos duplicados incluso con distinto formato', () => {
        const invalidos = [
            [], [{ id: 42, cantidad: 2 }], [{ id: ID, cantidad: 0 }], [{ id: ID, cantidad: 1.5 }],
            [{ id: ID, cantidad: 2147483648 }], [{ id: ID, cantidad: '1' }],
            [{ id: ID, cantidad: 1 }, { id: ID.toUpperCase(), cantidad: 2 }]
        ];
        for (const carrito of invalidos) {
            expect(() => prepararSolicitudOrden(carrito)).toThrowError(/productos y las cantidades/);
        }
        expect(prepararSolicitudOrden([{ id: ID.toUpperCase(), cantidad: 2 }], entrega)).toEqual({ ...solicitud, entrega });
    });

    it('solo recupera intentos con un payload reconocido y conserva compras anteriores sin despacho', () => {
        expect(solicitudDelIntento(intento(solicitud))).toEqual(solicitud);
        expect(solicitudDelIntento(intento({ ...solicitud, entrega }))).toEqual({ ...solicitud, entrega });
        const invalidos = [
            null, { id: 'inválido', cuerpo: '{}' }, { id: ORDEN, cuerpo: 123 }, { id: ORDEN, cuerpo: '{' },
            intento({ ...solicitud, total: 0 }), intento({ productos: null }), intento({ productos: [null] }),
            intento({ productos: [{ productoId: ID, cantidad: 2, precio: 1 }] }),
            intento({ productos: [{ productoId: 'invalido', cantidad: 2 }] }),
            intento({ ...solicitud, entrega: null }), intento({ ...solicitud, entrega: { ...entrega, precio: 1 } }),
            intento({ ...solicitud, entrega: { ...entrega, comuna: ' ' } }),
            intento({ ...solicitud, entrega: { ...entrega, telefono: 123 } })
        ];
        for (const guardado of invalidos) expect(solicitudDelIntento(guardado)).toBeNull();
    });

    it('bloquea una solicitud dañada y una verificación fallida del catálogo antes del POST', async () => {
        const red = spyOn(window, 'fetch').and.rejectWith(new TypeError('Sin red'));
        const enviar = crearEnvioOrden({ habilitado: true });
        await expectAsync(enviar({ id: ORDEN, cuerpo: 'incompleto' }, token))
            .toBeRejectedWithError(/intento de compra guardado no es válido/);
        expect(red).not.toHaveBeenCalled();
        await expectAsync(enviar(intento(solicitud), token)).toBeRejectedWithError(/verificar el catálogo/);
        expect(red).toHaveBeenCalledOnceWith('/api/v1/productos', jasmine.objectContaining({ method: 'GET', cache: 'no-store' }));
    });

    it('valida el id, las líneas y el monto antes de aceptar una confirmación', () => {
        const linea = { productoId: ID, cantidad: 2, nombre: 'Aceite de prueba' };
        const orden = { id: ORDEN, total: 18000, productos: [linea] };
        expect(validarOrdenConfirmada(orden, intento(solicitud))).toBe(orden);
        expect(() => validarOrdenConfirmada(orden, null)).toThrowError(/confirmación válida/);
        for (const cambios of [
            { id: null }, { id: ID }, { total: NaN }, { total: -1 }, { productos: null }, { productos: [] },
            { productos: [{ ...linea, productoId: ID + '0' }] },
            { productos: [{ ...linea, cantidad: 1 }] }, { productos: [{ ...linea, nombre: '' }] },
            { productos: [{ ...linea, nombre: 123 }] }
        ]) {
            expect(() => validarOrdenConfirmada({ ...orden, ...cambios }, intento(solicitud)))
                .toThrowError(/confirmación válida/);
        }
    });

    it('rechaza la forma incorrecta de la respuesta del catálogo', async () => {
        spyOn(window, 'fetch').and.resolveTo(Response.json({ productos: [] }));
        await expectAsync(prepararCarritoConectado([])).toBeRejectedWithError(/listado de productos/);
    });

    it('valida id de usuario antes de hacer una solicitud y envía el JWT solo a rutas válidas', async () => {
        const red = spyOn(window, 'fetch').and.callFake(async (url) =>
            url.endsWith('/resolucion') ? new Response(null, { status: 204 }) : Response.json([]));
        expect(() => obtenerClienteApi(token, '../ordenes')).toThrowError('El identificador no es válido.');
        expect(red).not.toHaveBeenCalled();
        await obtenerClienteApi(token, ID);
        await listarOrdenesClienteApi(token, ID);
        const datos = { nombre: 'Prueba', correo: 'prueba@example.test' };
        await editarClienteApi(token, ID, datos);
        expect(await resolverIncidenciaApi(token, ID)).toBeNull();
        const cabecera = jasmine.objectContaining({ Authorization: 'Bearer token-ficticio' });
        expect(red.calls.allArgs()).toEqual([
            ['/api/v1/usuarios/' + ID, jasmine.objectContaining({ method: 'GET', headers: cabecera, cache: 'no-store' })],
            ['/api/v1/usuarios/' + ID + '/ordenes', jasmine.objectContaining({ method: 'GET', headers: cabecera })],
            ['/api/v1/usuarios/' + ID, jasmine.objectContaining({ method: 'PUT', headers: cabecera, body: JSON.stringify(datos) })],
            ['/api/v1/incidencias/' + ID + '/resolucion', jasmine.objectContaining({ method: 'PUT', headers: cabecera })]
        ]);
        expect(red.calls.mostRecent().args[1].body).toBeUndefined();
    });

    it('formatea el estado y la fecha sin inventarlos cuando faltan', () => {
        const fecha = '2026-07-30T15:00:00Z';
        expect(formatearRegistro({ fechaCreacion: fecha, estado: 'ENVIADO' }))
            .toEqual(jasmine.objectContaining({ estado: 'Enviado', fecha: jasmine.stringMatching(/30/) }));
        expect(formatearRegistro({ fecha: 'sin fecha', estado: 'NUEVO' })).toEqual({ fecha: '—', estado: 'NUEVO' });
        expect(formatearRegistro({}).fecha).toBe('—');
    });

    it('rechaza la respuesta 202 si se esperaba la confirmación 201 y conserva el estado HTTP', async () => {
        const red = spyOn(window, 'fetch').and.resolveTo(Response.json({}, { status: 202 }));
        await expectAsync(enviarJsonApi('/ordenes', '{}', { estadoEsperado: 201 }))
            .toBeRejectedWith(jasmine.objectContaining({ estado: 202, message: jasmine.stringMatching(/inesperado/) }));
        await enviarJsonApi('/ordenes', '{}');
        expect(red.calls.mostRecent().args[1].method).toBe('POST');
        expect(new ErrorApi('Problema de red').estado).toBeUndefined();
    });

    it('exige Bearer y valida identificador, rol y campos de identidad', () => {
        const valida = { id: ID, rol: 'CLIENTE', nombre: 'Cuenta de prueba', correo: 'prueba@example.test' };
        expect(cabeceraBearer(token())).toEqual({ Authorization: 'Bearer token-ficticio' });
        for (const credencial of ['', null, 42]) {
            expect(() => cabeceraBearer(credencial)).toThrowError(ErrorApi, 'Inicia sesión conectada.');
        }
        expect(validarIdentidad({ ...valida, id: ID.toUpperCase(), hash: 'ignorado' })).toEqual(valida);
        for (const campos of [{ rol: 'OTRO' }, { id: '1' }, { nombre: null }, { correo: true }]) {
            expect(() => validarIdentidad({ ...valida, ...campos })).toThrowError(/identidad válida/);
        }
    });

    it('habilita el catálogo temporal únicamente en desarrollo y filtra IDs inválidos', () => {
        const ambiente = { AUTOCARE_ADMIN_PRUEBA: '1', AUTOCARE_ADMIN_PRODUCTOS_TEMPORALES: ' Mal, ' + ID.toUpperCase(),
            AUTOCARE_ADMIN_CATEGORIAS_TEMPORALES: ORDEN };
        expect(cargarConfiguracionAdmin(ambiente, false)).toEqual({ habilitada: false, productos: [], categorias: [] });
        expect(cargarConfiguracionAdmin({}, true).habilitada).toBeFalse();
        expect(cargarConfiguracionAdmin({ AUTOCARE_ADMIN_PRUEBA: '1' }, true).productos).toEqual([]);
        const config = cargarConfiguracionAdmin(ambiente, true);
        expect(config).toEqual({ habilitada: true, productos: [ID], categorias: [ORDEN] });
        globalThis.__AUTOCARE_PRUEBA_ADMIN__ = config;
        try {
            expect(configuracionAdminLocal()).toBe(config);
        } finally {
            delete globalThis.__AUTOCARE_PRUEBA_ADMIN__;
        }
    });
});
