import { obtenerJsonApi } from '../services/api.js';
import { obtenerCategoriasApi, obtenerProductosApi } from '../services/catalogoApi.js';

describe('Cliente REST del catálogo', () => {
    let fetchSimulado;

    beforeEach(() => {
        fetchSimulado = spyOn(window, 'fetch');
    });

    it('consulta productos por GET y devuelve el JSON del backend', async () => {
        const productos = [{ id: '660000000000000000000002', nombre: 'Aceite', precioFinal: 28000 }];
        fetchSimulado.and.resolveTo(Response.json(productos));

        expect(await obtenerProductosApi()).toEqual(productos);
        expect(fetchSimulado).toHaveBeenCalledOnceWith('/api/v1/productos', {
            method: 'GET',
            headers: { Accept: 'application/json, application/problem+json' }
        });
    });

    it('conserva una lista de categorías vacía', async () => {
        fetchSimulado.and.resolveTo(Response.json([]));

        expect(await obtenerCategoriasApi()).toEqual([]);
        expect(fetchSimulado).toHaveBeenCalledOnceWith('/api/v1/categorias', jasmine.any(Object));
    });

    it('acepta una URL base explícita con barra final', async () => {
        fetchSimulado.and.resolveTo(Response.json([]));

        await obtenerCategoriasApi({ urlBase: 'https://api.example.test/api/v1/' });

        expect(fetchSimulado).toHaveBeenCalledOnceWith(
            'https://api.example.test/api/v1/categorias', jasmine.any(Object)
        );
    });

    it('devuelve null si la respuesta HTTP 204 no tiene cuerpo', async () => {
        fetchSimulado.and.resolveTo(new Response(null, { status: 204 }));

        expect(await obtenerJsonApi('/categorias')).toBeNull();
    });

    it('conserva el estado y el detalle de un error HTTP con JSON', async () => {
        fetchSimulado.and.resolveTo(Response.json({
            detail: 'Revisa los campos indicados.',
            campos: { categoriaId: 'El identificador no es válido.' }
        }, { status: 400 }));

        await expectAsync(obtenerCategoriasApi()).toBeRejectedWith(jasmine.objectContaining({
            estado: 400,
            message: 'Revisa los campos indicados.',
            campos: { categoriaId: 'El identificador no es válido.' }
        }));
    });

    it('informa el estado de un error HTTP sin JSON', async () => {
        fetchSimulado.and.resolveTo(new Response('Backend no disponible', { status: 502 }));

        await expectAsync(obtenerCategoriasApi()).toBeRejectedWith(jasmine.objectContaining({
            estado: 502,
            message: 'La API respondió con HTTP 502.'
        }));
    });

    it('informa cuando una respuesta exitosa no contiene JSON válido', async () => {
        fetchSimulado.and.resolveTo(new Response('<html></html>'));

        await expectAsync(obtenerCategoriasApi()).toBeRejectedWithError('La API no devolvió un JSON válido.');
    });

    it('informa una falla de conexión sin devolver datos locales', async () => {
        fetchSimulado.and.rejectWith(new TypeError('Failed to fetch'));

        await expectAsync(obtenerCategoriasApi()).toBeRejectedWithError('No se pudo conectar con la API.');
    });
});
