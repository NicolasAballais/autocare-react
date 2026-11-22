import {
    render,
    screen,
    cleanup
} from '@testing-library/react';

import {
    MemoryRouter
} from 'react-router-dom';

import Carrito from '../pages/Carrito';
import Checkout from '../pages/Checkout';
import Pago from '../pages/Pago';

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
