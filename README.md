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

Vite permite los POST de autenticación únicamente en desarrollo y desde loopback cuando se activa su interruptor. Spring Security controla el acceso a la API y las órdenes que puede consultar cada cuenta.

## Administración conectada del catálogo

Un usuario ADMIN entra en `/catalogo-conectado/admin`. Las tarjetas Productos y Categorías consultan Spring Boot. Usuarios, notificaciones, incidencias, reportes y la gestión de órdenes mantienen sus datos de simulación local. El enlace **Ver órdenes conectadas** abre la consulta existente de Spring Boot.

El modo predeterminado permite consultar el catálogo desde el panel. Para autorizar escrituras se requiere el servidor de desarrollo Vite en loopback y `AUTOCARE_ADMIN_PRUEBA=1` en su terminal. Las ediciones y eliminaciones requieren además los ObjectId exactos de registros temporales recién creados. El cliente y el proxy consultan el registro vigente antes de modificarlo o eliminarlo. Un producto temporal usa un código `TEST-` y referencia una categoría de nombre `TEST-`. Las autorizaciones de ADMIN se validan en Spring Security.

### Prueba controlada tras la autorización

1. Inicia Spring Boot con `catalogo-local` según el README del backend. Verifica primero que los cuatro productos y las cuatro categorías originales estén presentes y registra sus IDs. Usa una sesión ADMIN conectada. Mantén `ENVIO_ORDENES_HABILITADO = false`.
2. En una terminal PowerShell de Vite, activa solo la creación temporal:

   ```powershell
   $env:AUTOCARE_ADMIN_PRUEBA = '1'
   Remove-Item Env:AUTOCARE_ADMIN_PRODUCTOS_TEMPORALES, Env:AUTOCARE_ADMIN_CATEGORIAS_TEMPORALES -ErrorAction SilentlyContinue
   npm.cmd run dev -- --host 127.0.0.1
   ```

3. Abre `http://127.0.0.1:5173/catalogo-conectado/admin` con el puerto que indique Vite. En Categorías, crea una de nombre único como `TEST-EV3-6A-AAAAMMDD`. En Productos, crea uno con un código único como `TEST-EV3-PROD-AAAAMMDD`, precio `1000`, descuento `10`, stock `3` y stock crítico `1`. Selecciona la categoría temporal. Consulta los listados y copia los ObjectId de estos dos registros. El ID del producto aparece en la URL de **Ver detalle**.
4. Detén Vite con Ctrl+C. Compara los IDs con los de los registros originales y autoriza únicamente los dos recién creados. Reinicia Vite desde la misma terminal.

   ```powershell
   $env:AUTOCARE_ADMIN_PRODUCTOS_TEMPORALES = '<ObjectId del producto temporal>'
   $env:AUTOCARE_ADMIN_CATEGORIAS_TEMPORALES = '<ObjectId de la categoría temporal>'
   npm.cmd run dev -- --host 127.0.0.1
   ```

5. Edita el precio o stock del producto temporal y renombra la categoría conservando `TEST-`. Comprueba los cambios en los listados. Intenta borrar la categoría con el producto asociado y comprueba el `409`. Para limpiar, borra primero el producto temporal y después su categoría. Verifica nuevamente los ocho registros originales.
6. Detén Vite, retira el interruptor y los IDs, y reinicia:

   ```powershell
   Remove-Item Env:AUTOCARE_ADMIN_PRUEBA, Env:AUTOCARE_ADMIN_PRODUCTOS_TEMPORALES, Env:AUTOCARE_ADMIN_CATEGORIAS_TEMPORALES -ErrorAction SilentlyContinue
   npm.cmd run dev -- --host 127.0.0.1
   ```

Spring Boot acepta un `PUT` completo y carece de edición condicional por versión. El cliente verifica si el registro cambió desde que se abrió el formulario. Realiza la prueba temporal desde una sola sesión administrativa para evitar ediciones simultáneas de esos registros. El proxy comprueba método, ruta e ID, y el cliente React verifica también el contenido del formulario. La prueba se realiza desde el panel.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
