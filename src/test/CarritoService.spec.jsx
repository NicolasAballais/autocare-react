import { act, renderHook } from '@testing-library/react';
import { CarritoProvider, useCarrito } from '../context/CarritoContext';
import {
    esIdProductoLocal,
    mismoIdProducto,
    prepararCarritoConectado,
    proponerCarritoConectado
} from '../services/carritoService';

const productoApi = {
    id: '6600000000000000000000a1',
    codigo: 'ACE001',
    nombre: 'Aceite Sintético',
    precio: 35000,
    descuento: 20,
    precioFinal: 28000,
    stock: 24
};

const lineaLocal = {
    id: 1,
    codigo: 'ACE001',
    nombre: 'Aceite Sintético',
    precioOriginal: 35000,
    precio: 28000,
    descuento: 20,
    stock: 24,
    cantidad: 2
};

describe('Compatibilidad del carrito con MongoDB', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => localStorage.clear());

    it('compara IDs numéricos y ObjectId como texto y distingue los dos formatos', () => {
        expect(mismoIdProducto(1, '1')).toBeTrue();
        expect(mismoIdProducto(productoApi.id, productoApi.id.toUpperCase())).toBeTrue();
        expect(mismoIdProducto(productoApi.id, 1)).toBeFalse();
        expect(mismoIdProducto(null, undefined)).toBeFalse();

        expect(esIdProductoLocal('1')).toBeTrue();
        expect(esIdProductoLocal(productoApi.id)).toBeFalse();
        expect(esIdProductoLocal('000000000000000000000001')).toBeFalse();
    });

    it('reconoce un producto antiguo por código y conserva su cantidad', () => {
        const linea = Object.freeze({ ...lineaLocal, codigo: ' ace001 ', cantidad: '2' });
        const { carritoPropuesto, avisos } = proponerCarritoConectado([linea], [productoApi]);

        expect(carritoPropuesto).toEqual([jasmine.objectContaining({
            id: productoApi.id, cantidad: 2, precio: 28000, precioOriginal: 35000, descuento: 20
        })]);
        expect(avisos).toEqual([]);
        expect(linea.id).toBe(1);
        expect(linea.cantidad).toBe('2');
    });

    it('prioriza el ObjectId y reúne en una línea las cantidades compatibles', () => {
        const lineaConMongo = { ...lineaLocal, id: productoApi.id.toUpperCase(), codigo: 'CODIGO-ANTERIOR', cantidad: 3 };
        const { carritoPropuesto, avisos } = proponerCarritoConectado([lineaConMongo, lineaLocal], [productoApi]);

        expect(carritoPropuesto.length).toBe(1);
        expect(carritoPropuesto[0].id).toBe(productoApi.id);
        expect(carritoPropuesto[0].cantidad).toBe(5);
        expect(avisos).toEqual([]);
    });

    it('informa cambios de precio y stock y limita la cantidad propuesta después de agrupar', () => {
        const otraLinea = { ...lineaLocal, id: productoApi.id, cantidad: 3 };
        const actualizado = { ...productoApi, descuento: 10, precioFinal: 31500, stock: 4 };
        const { carritoPropuesto, avisos } = proponerCarritoConectado([lineaLocal, otraLinea], [actualizado]);

        expect(carritoPropuesto).toEqual([jasmine.objectContaining({
            id: productoApi.id, cantidad: 4, precio: 31500, descuento: 10, stock: 4
        })]);
        expect(avisos).toEqual(jasmine.arrayContaining([
            jasmine.objectContaining({ tipo: 'precio-modificado', precioAnterior: 28000, precioActual: 31500 }),
            jasmine.objectContaining({ tipo: 'stock-modificado', stockAnterior: 24, stockActual: 4 }),
            jasmine.objectContaining({ tipo: 'stock-insuficiente', cantidadSolicitada: 5, cantidadDisponible: 4 })
        ]));
    });

    it('informa que se agotó el producto y lo deja fuera de la propuesta', () => {
        const agotado = { ...productoApi, stock: 0 };
        const { carritoPropuesto, avisos } = proponerCarritoConectado([lineaLocal], [agotado]);

        expect(carritoPropuesto).toEqual([]);
        expect(avisos).toContain(jasmine.objectContaining({
            tipo: 'stock-insuficiente', cantidadSolicitada: 2, cantidadDisponible: 0
        }));
    });

    it('informa productos inexistentes sin reasignar un ObjectId ausente al mismo código', () => {
        const sinCodigo = { ...lineaLocal, id: '2', codigo: undefined };
        const eliminado = { ...lineaLocal, id: '6600000000000000000000a2' };
        const { carritoPropuesto, avisos } = proponerCarritoConectado([sinCodigo, eliminado], [productoApi]);

        expect(carritoPropuesto).toEqual([]);
        expect(avisos.map(({ tipo, id }) => [tipo, id])).toEqual([
            ['producto-inexistente', sinCodigo.id], ['producto-inexistente', eliminado.id]
        ]);
    });

    it('informa cantidades que no son enteros positivos', () => {
        const carrito = [0, -1, 1.5, 'abc'].map((cantidad) => ({ ...lineaLocal, cantidad }));
        const { carritoPropuesto, avisos } = proponerCarritoConectado(carrito, [productoApi]);

        expect(carritoPropuesto).toEqual([]);
        expect(avisos.map(({ tipo }) => tipo)).toEqual(carrito.map(() => 'cantidad-invalida'));
    });

    it('prepara una propuesta mediante GET y conserva el carrito guardado', async () => {
        const carrito = [lineaLocal];
        const guardado = JSON.stringify(carrito, null, 2);
        localStorage.setItem('carritoAutoCare', guardado);
        const fetchSimulado = spyOn(window, 'fetch').and.resolveTo(Response.json([productoApi]));

        const propuesta = await prepararCarritoConectado(carrito);

        expect(propuesta.carritoPropuesto[0].id).toBe(productoApi.id);
        expect(fetchSimulado).toHaveBeenCalledOnceWith('/api/v1/productos', jasmine.objectContaining({ method: 'GET' }));
        expect(localStorage.getItem('carritoAutoCare')).toBe(guardado);
    });

    it('propaga el fallo de conexión y conserva el carrito para reintentar', async () => {
        const carrito = [lineaLocal];
        const guardado = JSON.stringify(carrito, null, 2);
        localStorage.setItem('carritoAutoCare', guardado);
        spyOn(window, 'fetch').and.rejectWith(new TypeError('Failed to fetch'));

        await expectAsync(prepararCarritoConectado(carrito)).toBeRejectedWithError('No se pudo conectar con la API.');

        expect(localStorage.getItem('carritoAutoCare')).toBe(guardado);
        expect(carrito).toEqual([lineaLocal]);
    });

    it('conserva el carrito local al cargar y rechaza altas conectadas', () => {
        const lineaGuardada = { ...lineaLocal, id: '1' };
        const guardado = JSON.stringify([lineaGuardada], null, 2);
        localStorage.setItem('carritoAutoCare', guardado);
        const { result } = renderHook(() => useCarrito(), { wrapper: CarritoProvider });

        act(() => result.current.agregarProducto(productoApi));
        expect(result.current.carrito).toEqual([lineaGuardada]);
        expect(localStorage.getItem('carritoAutoCare')).toBe(guardado);

        act(() => result.current.agregarProducto(lineaLocal));
        expect(result.current.carrito).toEqual([{ ...lineaGuardada, cantidad: 3 }]);
        act(() => result.current.cambiarCantidad(1, 4));
        expect(JSON.parse(localStorage.getItem('carritoAutoCare'))).toEqual([{ ...lineaGuardada, cantidad: 4 }]);
        act(() => result.current.eliminarProducto(1));
        expect(result.current.carrito).toEqual([]);
    });
});
