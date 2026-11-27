import { act, screen } from '@testing-library/react';

describe('Arranque de AutoCarePro', () => {
    it('monta la aplicación real y la portada del modo local', async () => {
        const clienteReact = require('react-dom/client');
        const crearRaiz = clienteReact.createRoot;
        const url = window.location.href;
        const historial = window.history.state;
        const contenedor = document.createElement('div');
        contenedor.id = 'root';
        document.body.append(contenedor);
        let raiz;
        spyOn(clienteReact, 'createRoot').and.callFake((elemento) => {
            raiz = crearRaiz(elemento);
            return raiz;
        });

        try {
            window.history.replaceState(null, '', '/');
            await act(async () => { await import('../main.jsx'); });
            expect(await screen.findByRole('heading', { name: 'Bienvenido a AutoCarePro' })).toBeTruthy();
        } finally {
            if (raiz) act(() => raiz.unmount());
            contenedor.remove();
            window.history.replaceState(historial, '', url);
            localStorage.clear();
        }
    });
});
