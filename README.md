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

Un usuario ADMIN entra en `/catalogo-conectado/admin`. Las tarjetas de administración consultan Spring Boot. Las rutas fuera de `/catalogo-conectado` conservan sus datos de simulación local. El enlace **Ver órdenes conectadas** abre la consulta existente de Spring Boot.

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

## Gestión conectada

Las rutas bajo `/catalogo-conectado/admin` usan Spring Boot para consultar y gestionar clientes, órdenes e incidencias. Stock crítico y reportes se calculan con los listados REST existentes. Un CLIENTE puede editar su perfil y reportar incidencias desde su sesión. El formulario conectado de contacto requiere sesión. Las rutas del simulador conservan sus datos de navegador.

Para probar con datos ficticios, inicia Spring Boot con `catalogo-local` y una base MongoDB local aislada. Inicia Vite con `npm.cmd run dev -- --host 127.0.0.1`. Para las escrituras de esta sección, usa `$env:AUTOCARE_GESTION_PRUEBA = '1'` antes de iniciar Vite. Autenticación, creación de compras y CRUD de productos y categorías conservan sus controles de prueba propios. La lectura de registros existentes funciona con `AUTOCARE_GESTION_PRUEBA` apagada.

- Como CLIENTE, completa el checkout de prueba y revisa el despacho en el detalle de la orden. Desde **Mis incidencias**, crea un caso con esa orden y revisa su estado. Desde el nombre de la cuenta, abre el perfil.
- Como ADMIN, abre **Administración** para crear o editar clientes, consultar sus órdenes, marcar un despacho enviado, resolver incidencias y ver avisos y reportes.
- En otra sesión, comprueba que VENDEDOR puede consultar órdenes y productos. La API reserva los datos de entrega para el comprador y ADMIN.

El navegador conserva el cuerpo del intento de compra en el carrito de la cuenta para que un reintento use la misma clave y entrega aunque se recargue la página. Tras confirmar, conserva el resumen de la orden y descarta los datos de entrega del intento.

## Preparar el frontend en Railway

Conecta este repositorio como un servicio Dockerfile. El build usa Node 24, `npm ci` y `npm run build:railway`. Caddy sirve `dist-railway` y Railway termina HTTPS en el dominio público de este servicio. El backend permanece como servicio privado en el mismo proyecto y entorno.

- Define `API_INTERNA=http://autocare-backend.railway.internal:8080`, ajustando el nombre si el servicio difiere. Es una variable de Caddy y solo se usa del lado servidor.
- Usa `/healthz` como healthcheck del frontend y el `PORT` asignado por Railway. Caddy reenvía `/api/v1/*` a Spring Boot y sirve `index.html` para las rutas de React Router.
- Configura `MONGODB_URI` y `JWT_SECRET_BASE64` solamente en el backend. Sigue su README para el perfil `railway`, la base aislada `autocarepro_demo` y el healthcheck.
- El repositorio debe publicarse con `AUTOCARE_DEMO_REGISTRO` y `AUTOCARE_DEMO_ESCRITURAS` cerrados en el backend. El frontend lee ambos valores de `GET /api/v1/configuracion` y arranca con los controles cerrados hasta obtener una respuesta válida.
- El build `railway` reemplaza el fixture de cuentas locales por una lista vacía, inicia en el catálogo conectado y deshabilita la navegación a los módulos de simulación. El desarrollo local conserva la configuración de Vite y su fixture original.

Con autorización, prueba primero catálogo, rutas directas y login de las cuentas preparadas. Después habilita el registro o las escrituras en el backend de demostración, recarga el navegador y comprueba los roles. Mantén la base original fuera del alcance del usuario de aplicación de Railway.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
