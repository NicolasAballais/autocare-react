import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { IDS } from './datos.js';

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'api-solo-simulada',
            configureServer(servidor) {
                servidor.middlewares.use('/api', (_peticion, respuesta) => {
                    respuesta.statusCode = 503;
                    respuesta.end('La API de esta instancia se simula en Playwright.');
                });
            }
        }
    ],
    define: {
        __AUTOCARE_RAILWAY__: 'false',
        __AUTOCARE_PRUEBA_AUTH__: 'true',
        __AUTOCARE_PRUEBA_ORDENES__: 'true',
        __AUTOCARE_PRUEBA_GESTION__: 'true',
        __AUTOCARE_PRUEBA_ADMIN__: JSON.stringify({
            habilitada: true,
            productos: [IDS.aceite, IDS.productoNuevo],
            categorias: [IDS.aceites, IDS.categoriaNueva]
        })
    },
    server: { host: '127.0.0.1', port: 4178, strictPort: true }
});
