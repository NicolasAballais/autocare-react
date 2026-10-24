import {
    render,
    screen,
    cleanup,
    fireEvent
} from '@testing-library/react';

import {
    MemoryRouter
} from 'react-router-dom';

import Productos from '../pages/Productos';

import {
    CarritoProvider
} from '../context/CarritoContext';


function renderizarProductos() {

    return render(
        <MemoryRouter>
            <CarritoProvider>
                <Productos />
            </CarritoProvider>
        </MemoryRouter>
    );
}


describe('Página de Productos', () => {

    beforeEach(() => {

        localStorage.clear();

    });


    afterEach(() => {

        cleanup();

    });


    /*
        TEST 1
        Comprueba el renderizado de los productos.
    */
    it('renderiza los cuatro productos del catálogo', () => {

        renderizarProductos();


        expect(
            screen.getByText(
                'Aceite Sintético 5W-30'
            )
        ).toBeTruthy();


        expect(
            screen.getByText(
                'Kit Detailing Básico'
            )
        ).toBeTruthy();


        expect(
            screen.getByText(
                'Ampolleta H7 LED'
            )
        ).toBeTruthy();


        expect(
            screen.getByText(
                'Filtro de Aire Premium'
            )
        ).toBeTruthy();


        expect(
            screen.getByText(
                '4 productos disponibles'
            )
        ).toBeTruthy();

    });


    /*
        TEST 2
        Comprueba el renderizado condicional
        de una oferta.
    */
    it('muestra el descuento y precio de oferta del aceite', () => {

        renderizarProductos();


        expect(
            screen.getByText('-20%')
        ).toBeTruthy();


        expect(
            screen.getByText('$28.000')
        ).toBeTruthy();

    });

});


it('filtra productos utilizando el buscador', () => {

    renderizarProductos();

    const buscador = screen.getByPlaceholderText(
        'Buscar productos por nombre, categoría o descripción...'
    );

    fireEvent.change(
        buscador,
        {
            target: {
                value: 'Ampolleta'
            }
        }
    );

    expect(
        screen.getByText('Ampolleta H7 LED')
    ).toBeTruthy();

    expect(
        screen.queryByText('Kit Detailing Básico')
    ).toBeNull();

});


it('permite seleccionar un filtro de categoría', () => {

    renderizarProductos();

    const botonCategoria = screen.getByRole(
        'button',
        {
            name: 'Detailing y Limpieza'
        }
    );

    fireEvent.click(
        botonCategoria
    );

    expect(
        screen.getByText('Kit Detailing Básico')
    ).toBeTruthy();

    expect(
        screen.queryByText('Ampolleta H7 LED')
    ).toBeNull();

});