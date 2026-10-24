import {
    render,
    screen,
    cleanup,
    fireEvent
} from '@testing-library/react';

import Contacto from '../pages/Contacto';


describe('Formulario de Contacto', () => {

    beforeEach(() => {

        localStorage.clear();

    });


    afterEach(() => {

        cleanup();

    });


    /*
        TEST 9
        Comprueba que el estado del formulario
        cambia cuando el usuario escribe.
    */
    it('actualiza los campos cuando el usuario escribe', () => {

        render(
            <Contacto />
        );


        const nombre = screen.getByPlaceholderText(
            'Tu nombre'
        );

        const correo = screen.getByPlaceholderText(
            'ejemplo@duoc.cl'
        );

        const mensaje = screen.getByPlaceholderText(
            'Escribe tu mensaje aquí...'
        );


        fireEvent.change(
            nombre,
            {
                target: {
                    value: 'Ricardo Prueba'
                }
            }
        );


        fireEvent.change(
            correo,
            {
                target: {
                    value: 'ricardo@gmail.com'
                }
            }
        );


        fireEvent.change(
            mensaje,
            {
                target: {
                    value: 'Consulta de prueba'
                }
            }
        );


        expect(
            nombre.value
        ).toBe('Ricardo Prueba');


        expect(
            correo.value
        ).toBe('ricardo@gmail.com');


        expect(
            mensaje.value
        ).toBe('Consulta de prueba');

    });


    /*
        TEST 10
        Comprueba que el formulario responde
        correctamente al evento de envío.
    */
    it('muestra confirmación al enviar un formulario válido', () => {

        render(
            <Contacto />
        );


        fireEvent.change(
            screen.getByPlaceholderText(
                'Tu nombre'
            ),
            {
                target: {
                    value: 'Ricardo Prueba'
                }
            }
        );


        fireEvent.change(
            screen.getByPlaceholderText(
                'ejemplo@duoc.cl'
            ),
            {
                target: {
                    value: 'ricardo@gmail.com'
                }
            }
        );


        fireEvent.change(
            screen.getByPlaceholderText(
                'Escribe tu mensaje aquí...'
            ),
            {
                target: {
                    value: 'Necesito información sobre un producto.'
                }
            }
        );


        fireEvent.click(
            screen.getByRole(
                'button',
                {
                    name: 'Enviar mensaje'
                }
            )
        );


        expect(
            screen.getByText(
                'Tu mensaje fue enviado correctamente.'
            )
        ).toBeTruthy();

    });

});