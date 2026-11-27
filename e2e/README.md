# Verificación de AutoCarePro · EV3

Ejecuta los comandos desde `autocare-react` en la terminal PowerShell de VS Code. Se utiliza Google Chrome instalado. `npm.cmd ci` instala Playwright, Karma y sus demás dependencias desde el lockfile.

## Playwright

| Tarea | Comando PowerShell |
| --- | --- |
| Suite visual completa, Chrome abierto y un recorrido a la vez | `npm.cmd run test:e2e:visual` |
| Suite visual de un rol | `npm.cmd run test:e2e:visual -- e2e/cliente.spec.js` |
| Suite automática de un rol | `npm.cmd run test:e2e -- e2e/admin.spec.js` |
| Un escenario, filtrado por parte de su título | `npm.cmd run test:e2e:visual -- e2e/cliente.spec.js -g "reintenta con la misma clave"` |
| Suite automática completa | `npm.cmd run test:e2e` |
| Panel interactivo Playwright UI | `npm.cmd run test:e2e:ui` |
| Mostrar el reporte automático | `npx.cmd playwright show-report playwright-report/automatico` |
| Mostrar el reporte visual | `npx.cmd playwright show-report playwright-report/visual` |

Usa `e2e/cliente.spec.js`, `e2e/admin.spec.js`, `e2e/vendedor.spec.js` o `e2e/invitado.spec.js` para elegir el rol. El modo visual aplica una pausa de 250 ms en las acciones de Chrome. Desde VS Code también puedes instalar **Playwright Test for VS Code**, abrir la vista **Testing**, activar **Show Browser** y ejecutar un escenario. El panel Playwright UI permite filtrar y recorrer la línea de tiempo de cada acción. [Integración con VS Code](https://playwright.dev/docs/getting-started-vscode) · [Playwright UI](https://playwright.dev/docs/test-ui-mode)

Los reportes HTML se guardan en `playwright-report/automatico/` y `playwright-report/visual/`. Los JSON y los archivos de resultados quedan bajo `test-results/automatico/` y `test-results/visual/`. La ejecución más reciente de cada modo reemplaza su reporte. La opción `--list` permite comprobar un filtro sin reemplazar el reporte.

Los escenarios levantan un Vite de pruebas dedicado en `127.0.0.1:4178`, sin proxy a Spring. Cada prueba recibe datos ficticios en memoria y un perfil de navegador independiente. Las llamadas de la API se interceptan y los destinos externos se bloquean. Si una solicitud de la API carece de simulación, el escenario falla. Las capturas adjuntas en HTML corresponden a esos recorridos. Ejecuta un modo de Playwright a la vez.

## Karma y Jasmine

```powershell
npm.cmd test
Start-Process -FilePath (Resolve-Path '.\coverage\karma\html\index.html')
```

El resumen sale en la terminal. El HTML muestra ramas y líneas pendientes por archivo. `coverage/karma/coverage-summary.json` guarda el resumen por módulo y `coverage/karma/coverage-final.json` conserva los contadores detallados.

Si Karma requiere la ruta del navegador, define `$env:CHROME_BIN = 'C:/Program Files/Google/Chrome/Application/chrome.exe'` en esa terminal. En el entorno restringido de la verificación se usó además `$env:AUTOCARE_NAVEGADOR_AISLADO = '1'` con un perfil temporal de pruebas. Un escritorio Windows normal puede ejecutar `npm.cmd test` con la configuración predeterminada.

## Evidencia EV3 · 26 de noviembre de 2026

| Ejecución | Resultado |
| --- | --- |
| Playwright automático con Chrome | 20 de 20 aprobadas |
| Playwright visual con Chrome | 20 de 20 aprobadas |
| Karma y Jasmine con Chrome Headless | 183 de 183 aprobadas, frente a 154 en la línea base |
| Spring Boot con Maven offline y replica set temporal de loopback | 119 de 119 aprobadas. Incluye 6 pruebas con MongoDB local. JAR generado |
| Vite | Builds local y de modo Railway aprobados. Vite informó el aviso de tamaño del bundle |

| Métrica | Base original, 67 archivos | Final sobre los mismos 67 | Final ampliado, 76 archivos |
| --- | ---: | ---: | ---: |
| Statements | 75,55 % | 90,29 % | 90,86 % (1761/1938) |
| Branches | 73,23 % | 84,12 % | 84,57 % (1776/2100) |
| Functions | 75,70 % | 91,58 % | 92,99 % (491/528) |
| Lines | 76,13 % | 90,97 % | 91,66 % (1594/1739) |

El alcance final contiene los 76 archivos JavaScript y JSX de aplicación bajo `src`, incluidos `main.jsx`, `App.jsx`, contextos y hooks. Los cuatro indicadores llegaron a 100 % en `api.js`, `authApi.js`, `ordenesApi.js`, `operacionesApi.js`, `carritoService.js` y `RutaConectada.jsx`. Las pruebas ejercitan solicitudes inválidas, credenciales y permisos, respuestas tardías, protección contra envíos repetidos, migración de credenciales locales, errores de edición y rechazo de stock o pago.

Entre las condiciones aún pendientes en Karma están errores de almacenamiento en `SesionConectadaProvider.jsx`, algunos bloqueos de intentos desactualizados en `CarritoConectadoContext.jsx` e IDs fuera de la lista de pruebas en `adminCatalogoApi.js`. `Blog.jsx`, `BlogDetalle.jsx` y `Nosotros.jsx` se recorren en Playwright y figuran sin sentencias ejecutadas en Karma. El HTML y los JSON detallan las demás ramas sin ejecutar.

| Rol | Escenarios | Comprobaciones |
| --- | ---: | --- |
| CLIENTE | 8 | Login y errores, carrito y stock, despacho, comprobante, reintento, orden ajena, incidencias, perfil y contacto |
| ADMIN | 5 | Productos y categorías, conflicto por asociación, alta y edición de clientes, historial, envío de órdenes, resolución de incidencias, stock crítico y reportes |
| VENDEDOR | 2 | Lectura de catálogo, órdenes y comprobante, ocultamiento del despacho, bloqueo de rutas y cierre de sesión |
| INVITADO | 5 | Catálogo y filtros, registro y validaciones, paso a login, importación de carrito, compra y boleta locales, Blog y Nosotros |

Para el informe, usa las capturas adjuntas del comprobante de CLIENTE, estado de una incidencia, producto, despacho y reporte de ADMIN, comprobante de VENDEDOR y catálogo y boleta local de INVITADO. Identifica esas capturas como **recorridos de interfaz con datos simulados**. Las pruebas de Spring verifican permisos y persistencia con un entorno separado. La integración React–Spring–MongoDB en una sola sesión de navegador, el despliegue y los navegadores adicionales quedan fuera de esta ejecución.
