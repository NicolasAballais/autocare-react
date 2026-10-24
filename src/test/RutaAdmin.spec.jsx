import {
    render,
    screen,
    cleanup
} from '@testing-library/react';

import {
    MemoryRouter,
    Routes,
    Route
} from 'react-router-dom';

import RutaAdmin from '../components/RutaAdmin';


describe('RutaAdmin', () => {

    beforeEach(() => {

        localStorage.clear();

    });


    afterEach(() => {

        cleanup();

    });


    /*
        TEST 7

        Comprueba que RutaAdmin recibe y
        renderiza correctamente children
        cuando el usuario es administrador.
    */
    it('permite al administrador acceder al contenido protegido', () => {

        localStorage.setItem(
            'sesionAutoCare',
            JSON.stringify({
                id: 1,
                nombre: 'Administrador',
                apellido: 'AutoCare',
                correo: 'admin@autocare.cl',
                rol: 'admin'
            })
        );


        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>

                    <Route
                        path="/admin"
                        element={
                            <RutaAdmin>
                                <h1>
                                    Contenido administrativo
                                </h1>
                            </RutaAdmin>
                        }
                    />

                    <Route
                        path="/"
                        element={
                            <p>Página principal</p>
                        }
                    />

                    <Route
                        path="/login"
                        element={
                            <p>Página de login</p>
                        }
                    />

                </Routes>
            </MemoryRouter>
        );


        expect(
            screen.getByText(
                'Contenido administrativo'
            )
        ).toBeTruthy();

    });


    /*
        TEST 8

        Comprueba el renderizado condicional:
        un cliente no puede ver el contenido
        administrativo.
    */
    it('bloquea a un cliente y lo redirige fuera del área administrativa', () => {

        localStorage.setItem(
            'sesionAutoCare',
            JSON.stringify({
                id: 2,
                nombre: 'Cliente',
                apellido: 'Prueba',
                correo: 'cliente@prueba.cl',
                rol: 'cliente'
            })
        );


        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>

                    <Route
                        path="/admin"
                        element={
                            <RutaAdmin>
                                <h1>
                                    Contenido administrativo
                                </h1>
                            </RutaAdmin>
                        }
                    />

                    <Route
                        path="/"
                        element={
                            <p>Página principal</p>
                        }
                    />

                    <Route
                        path="/login"
                        element={
                            <p>Página de login</p>
                        }
                    />

                </Routes>
            </MemoryRouter>
        );


        expect(
            screen.queryByText(
                'Contenido administrativo'
            )
        ).toBeNull();


        expect(
            screen.getByText(
                'Página principal'
            )
        ).toBeTruthy();

    });

});