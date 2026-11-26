import {
    render,
    screen,
    fireEvent,
    cleanup
} from '@testing-library/react';

import {
    MemoryRouter,
    Route,
    Routes
} from 'react-router-dom';

import Carrito from '../pages/Carrito';
import Checkout from '../pages/Checkout';
import Pago from '../pages/Pago';
import CompraExitosa from '../pages/CompraExitosa';
import DetalleOrden from '../pages/DetalleOrden';
import Boleta from '../pages/Boleta';
import { ordenPerteneceAUsuario } from '../services/ordenesService';

import {
    CarritoProvider
} from '../context/CarritoContext';


function renderizarConCarrito(componente, entrada = '/') {

    return render(
        <MemoryRouter initialEntries={[entrada]}>
            <CarritoProvider>
                {componente}
            </CarritoProvider>
        </MemoryRouter>
    );
}


describe('Flujo de compra', () => {

    beforeEach(() => {

        localStorage.clear();

    });


    afterEach(() => {

        cleanup();

    });


    /*
        TEST 5
        Comprueba el carrito vacío.
    */
    it('muestra un mensaje cuando el carrito está vacío', () => {

        renderizarConCarrito(
            <Carrito />
        );


        expect(
            screen.getByText(
                'Tu carrito está vacío'
            )
        ).toBeTruthy();


        expect(
            screen.queryByText(
                'Continuar al checkout'
            )
        ).toBeNull();

    });


    /*
        TEST 6
        Comprueba que Checkout bloquea
        el acceso sin productos.
    */
    it('bloquea el checkout cuando no existen productos en el carrito', () => {

        renderizarConCarrito(
            <Checkout />
        );


        expect(
            screen.getByText(
                'Tu carrito está vacío'
            )
        ).toBeTruthy();


        expect(
            screen.getByText(
                'Ver productos'
            )
        ).toBeTruthy();

    });

    it('limita la cantidad local al stock guardado en el carrito', () => {
        localStorage.setItem('carritoAutoCare', JSON.stringify([{ id: 1, nombre: 'Aceite de prueba', precio: 28000, stock: 2, cantidad: 1 }]));
        renderizarConCarrito(<Carrito />);
        const cantidad = screen.getByRole('spinbutton', { name: 'Cantidad:' });
        fireEvent.change(cantidad, { target: { value: '5' } });
        expect(cantidad.value).toBe('2');
        expect(JSON.parse(localStorage.getItem('carritoAutoCare'))[0].cantidad).toBe(2);
    });

    it('conserva la cantidad local ante entradas fraccionarias, negativas o vacías', () => {
        const guardado = JSON.stringify([{ id: 1, nombre: 'Aceite de prueba', precio: 1000, stock: 4, cantidad: 2 }]);
        localStorage.setItem('carritoAutoCare', guardado);
        renderizarConCarrito(<Carrito />);
        const cantidad = screen.getByRole('spinbutton', { name: 'Cantidad:' });
        for (const value of ['1.5', '-1', '0', '']) {
            fireEvent.change(cantidad, { target: { value } });
            expect(cantidad.value).toBe('2');
        }
        expect(localStorage.getItem('carritoAutoCare')).toBe(guardado);
    });

    it('permite que un invitado vea la orden y la boleta desde el pago local exitoso', () => {
        localStorage.setItem('carritoAutoCare', JSON.stringify([
            { id: 1, nombre: 'Aceite de prueba', precio: 1000, stock: 4, cantidad: 1 }
        ]));
        localStorage.setItem('productosAutoCare', JSON.stringify([{ id: 1, stock: 4 }]));
        localStorage.setItem('ordenesAutoCare', '[]');

        renderizarConCarrito(
            <Routes>
                <Route path="/pago" element={<Pago />} />
                <Route path="/compra-exitosa" element={<CompraExitosa />} />
                <Route path="/ordenes/:id" element={<DetalleOrden />} />
                <Route path="/ordenes/:id/boleta" element={<Boleta />} />
            </Routes>,
            { pathname: '/pago', state: {
                datosCliente: { nombre: 'Invitado de prueba', correo: 'invitado@example.test' },
                tipoEntrega: 'Envío estándar'
            } }
        );

        fireEvent.click(screen.getByRole('radio', { name: 'Tarjeta de débito' }));
        fireEvent.click(screen.getByRole('button', { name: 'Pagar' }));
        expect(screen.getByRole('heading', { name: 'Compra realizada con éxito' })).toBeTruthy();
        const [orden] = JSON.parse(localStorage.getItem('ordenesAutoCare'));
        expect(JSON.parse(localStorage.getItem('productosAutoCare'))[0].stock).toBe(3);
        expect(JSON.parse(localStorage.getItem('carritoAutoCare'))).toEqual([]);

        fireEvent.click(screen.getByRole('link', { name: 'Ver orden' }));
        expect(screen.getByRole('heading', { name: 'Orden #' + orden.id })).toBeTruthy();
        fireEvent.click(screen.getByRole('link', { name: 'Ver boleta' }));
        expect(screen.getByRole('heading', { name: 'Boleta AutoCarePro' })).toBeTruthy();
        fireEvent.click(screen.getByRole('link', { name: 'Volver a la orden' }));
        expect(screen.getByRole('heading', { name: 'Orden #' + orden.id })).toBeTruthy();
    });

    it('exige sesión al abrir directamente una boleta invitada sin pasar por la confirmación', () => {
        localStorage.setItem('ordenesAutoCare', JSON.stringify([{ id: 123, usuarioId: null }]));
        renderizarConCarrito(
            <Routes><Route path="/ordenes/:id/boleta" element={<Boleta />} /></Routes>,
            '/ordenes/123/boleta'
        );
        expect(screen.getByText('Debes iniciar sesión para consultar una boleta.')).toBeTruthy();
    });

    it('resuelve las órdenes antiguas por correo y usa el nombre solamente cuando falta el correo', () => {
        const usuario = { id: 1, nombre: 'Rosa', apellido: 'Pérez', correo: 'rosa@example.test', rol: 'cliente' };
        const nombre = 'Rosa Pérez';
        expect(ordenPerteneceAUsuario({ cliente: { nombre, correo: 'otra@example.test' } }, usuario)).toBeFalse();
        expect(ordenPerteneceAUsuario({ cliente: { nombre, correo: ' ROSA@example.test ' } }, usuario)).toBeTrue();
        expect(ordenPerteneceAUsuario({ cliente: { nombre } }, usuario)).toBeTrue();
        expect(ordenPerteneceAUsuario({ usuarioId: 2, cliente: { nombre, correo: usuario.correo } }, usuario)).toBeFalse();
    });

    it('rechaza el pago local cuando el stock vigente ya no alcanza', () => {
        const carrito = JSON.stringify([{ id: 1, nombre: 'Aceite de prueba', precio: 1000, stock: 4, cantidad: 2 }]);
        localStorage.setItem('carritoAutoCare', carrito);
        localStorage.setItem('productosAutoCare', JSON.stringify([{ id: 1, stock: 1 }]));
        renderizarConCarrito(<Pago />, {
            pathname: '/pago',
            state: { datosCliente: { nombre: 'Cliente de prueba' }, tipoEntrega: 'Envío estándar' }
        });
        fireEvent.click(screen.getByRole('radio', { name: 'Tarjeta de débito' }));
        fireEvent.click(screen.getByRole('button', { name: 'Pagar' }));
        expect(screen.getByRole('alert').textContent).toContain('El stock disponible cambió');
        expect(localStorage.getItem('ordenesAutoCare')).toBeNull();
        expect(localStorage.getItem('carritoAutoCare')).toBe(carrito);
        expect(JSON.parse(localStorage.getItem('productosAutoCare'))[0].stock).toBe(1);
    });

    it('rechaza una dirección con solo espacios en el checkout local', () => {
        localStorage.setItem('carritoAutoCare', JSON.stringify([{ id: 1, nombre: 'Aceite de prueba', precio: 1000, stock: 4, cantidad: 1 }]));
        renderizarConCarrito(<Checkout />);
        for (const [etiqueta, value] of Object.entries({
            'Nombre completo': 'Cliente', 'Correo electrónico': 'cliente@example.test', Teléfono: '111111111',
            Comuna: 'Santiago', 'Dirección de entrega': '   ', 'Método de entrega': 'Envío estándar'
        })) {
            fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } });
        }
        fireEvent.click(screen.getByRole('button', { name: 'Continuar al pago' }));
        expect(screen.getByRole('alert').textContent).toContain('Completa todos los datos de entrega');
        expect(localStorage.getItem('ordenesAutoCare')).toBeNull();
    });

    it('impide enviar el checkout local mientras falten los campos de entrega', () => {
        localStorage.setItem('carritoAutoCare', JSON.stringify([{ id: 1, nombre: 'Aceite de prueba', precio: 28000, stock: 2, cantidad: 1 }]));
        renderizarConCarrito(
            <Routes>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/pago" element={<h1>Pago local</h1>} />
            </Routes>,
            '/checkout'
        );
        const continuar = screen.getByRole('button', { name: 'Continuar al pago' });
        expect(screen.getByLabelText('Dirección de entrega').validity.valueMissing).toBeTrue();
        expect(continuar.form.checkValidity()).toBeFalse();
        fireEvent.click(continuar);
        expect(screen.getByRole('heading', { name: 'Checkout' })).toBeTruthy();
        expect(screen.queryByRole('heading', { name: 'Pago local' })).toBeNull();
        expect(localStorage.getItem('ordenesAutoCare')).toBeNull();
    });

    it('bloquea el pago simulado con un ObjectId aunque el carrito incluya productos locales', () => {
        const carritoGuardado = JSON.stringify([
            { id: 1, precio: 28000, cantidad: 1 },
            { id: '6600000000000000000000a1', precio: 28000, cantidad: 1 }
        ]);
        const ordenesGuardadas = JSON.stringify([{ id: 123, total: 28000 }]);
        localStorage.setItem('carritoAutoCare', carritoGuardado);
        localStorage.setItem('ordenesAutoCare', ordenesGuardadas);

        renderizarConCarrito(<Pago />, {
            pathname: '/pago',
            state: { datosCliente: { nombre: 'Cliente de prueba' }, tipoEntrega: 'Envío estándar' }
        });

        expect(screen.getByRole('alert').textContent).toContain('El pago simulado requiere un carrito local');
        expect(screen.queryByRole('button', { name: 'Pagar' })).toBeNull();
        expect(localStorage.getItem('carritoAutoCare')).toBe(carritoGuardado);
        expect(localStorage.getItem('ordenesAutoCare')).toBe(ordenesGuardadas);
        expect(localStorage.getItem('productosAutoCare')).toBeNull();
    });

});
