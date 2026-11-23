# AutoCarePro

## Autenticación conectada

El catálogo de Spring Boot está disponible en `/catalogo-conectado`. Sus formularios de autenticación se encuentran en `/catalogo-conectado/login` y `/catalogo-conectado/registro`. La tienda simulada utiliza sus rutas y su sesión habituales.

React comprueba la identidad con `/api/v1/auth/me` al iniciar sesión y al recargar. Guarda el JWT y su vencimiento en `sessionStorage`. El almacenamiento está limitado a la pestaña y sigue siendo accesible para JavaScript del mismo origen ante un XSS. El cierre elimina la copia de la pestaña. El JWT vence según la configuración de Spring Boot. Cada solicitud protegida recibe un Bearer de la sesión vigente y el backend decide los permisos.

Los carritos e intentos conectados se guardan por ID de comprador. Una compra sin confirmación se puede consultar al volver a la misma cuenta. El reintento reutiliza la clave y el cuerpo guardados. Las selecciones hechas sin iniciar sesión se pueden copiar desde el carrito mediante confirmación.

### Prueba local tras la autorización

1. En el backend, inicia el perfil `catalogo-local` siguiendo su README. Usa las variables privadas `MONGODB_URI` y `JWT_SECRET_BASE64` en la terminal de Spring Boot.
2. Cambia `AUTH_CONECTADA_HABILITADA` a `true` en `src/services/authConfiguracion.js` y conserva `ENVIO_ORDENES_HABILITADO = false` en `src/services/ordenesConfiguracion.js`.
3. Desde PowerShell en el frontend, ejecuta `npm.cmd run dev -- --host 127.0.0.1`. Abre `http://127.0.0.1:5173/catalogo-conectado/login` con el puerto que imprima Vite. Usa una cuenta autorizada para comprobar el login. El registro público crea una cuenta CLIENTE en la base configurada.
4. Comprueba el perfil, recarga la pestaña y cierra sesión. Al terminar, vuelve a poner `AUTH_CONECTADA_HABILITADA = false` y reinicia Vite.

Vite permite los POST de autenticación únicamente en desarrollo y desde loopback cuando se activa su interruptor. Los cambios administrativos del panel actual son de simulación local. Spring Security controla el acceso a la API y las órdenes que puede consultar cada cuenta.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
