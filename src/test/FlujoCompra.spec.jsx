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

import {
    CarritoProvider
} from '../context/CarritoContext';


function renderizarConCarrito(componente) {

    return render(
        <MemoryRouter>
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

});