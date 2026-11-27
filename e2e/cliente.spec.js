import { capturar, expect, iniciarSesion, test } from './api-simulada.js';
import { ACEITE, CLAVE_FICTICIA, CUENTAS, ENTREGA, FILTRO, IDS, RUTAS } from './datos.js';

async function completarEntrega(page, datos = ENTREGA) {
    await page.getByLabel('Nombre completo').fill(datos.nombre);
    await page.getByLabel('Correo electrónico').fill(datos.correo);
    await page.getByLabel('Teléfono').fill(datos.telefono);
    await page.getByLabel('Comuna').fill(datos.comuna);
    await page.getByLabel('Dirección de entrega').fill(datos.direccion);
    await page.getByLabel('Método de entrega').selectOption(datos.tipo);
}

async function prepararCompra(page) {
    await iniciarSesion(page, 'CLIENTE');
    await page.getByRole('button', { name: 'Agregar ' + ACEITE + ' al carrito conectado' }).click();
    await page.getByRole('link', { name: 'Carrito conectado' }).click();
    const cantidad = page.getByRole('spinbutton', { name: 'Cantidad:' });
    await cantidad.fill('2');
    await expect(page.getByText('Cantidad total: 2')).toBeVisible();
    await cantidad.fill('5');
    await expect(cantidad).toHaveValue('2');
    await page.getByRole('link', { name: 'Continuar al checkout' }).click();
    await completarEntrega(page, { ...ENTREGA, direccion: '' });
    await page.getByRole('button', { name: 'Revisar compra' }).click();
    await expect(page).toHaveURL(/\/carrito\/checkout$/);
    expect(await page.getByLabel('Dirección de entrega').evaluate((campo) => campo.validity.valueMissing)).toBe(true);
    await page.getByLabel('Dirección de entrega').fill(ENTREGA.direccion);
    await page.getByRole('button', { name: 'Revisar compra' }).click();
    await expect(page.getByText('Entrega seleccionada: Envío estándar')).toBeVisible();
}

test('CLIENTE · rechaza credenciales incorrectas y permite cerrar sesión', async ({ page }) => {
    await page.goto(RUTAS.login);
    await page.getByLabel('Correo electrónico').fill(CUENTAS.CLIENTE.correo);
    await page.getByLabel('Contraseña', { exact: true }).fill('IncorrectaPrueba');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByText('Correo o contraseña incorrectos.')).toBeVisible();

    await page.getByLabel('Contraseña', { exact: true }).fill(CLAVE_FICTICIA);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('navigation').getByRole('link', { name: CUENTAS.CLIENTE.nombre })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await page.goto(RUTAS.ordenes);
    await expect(page).toHaveURL(new RegExp(RUTAS.login + '$'));
    await expect(page.getByRole('heading', { name: 'Iniciar sesión conectada' })).toBeVisible();
});

test('CLIENTE · compra con despacho y consulta el comprobante histórico', async ({ page, api }, testInfo) => {
    await prepararCompra(page);
    await page.getByRole('button', { name: 'Confirmar compra' }).click();
    await expect(page.getByRole('heading', { name: 'Orden confirmada' })).toBeVisible();
    expect(api.compras).toHaveLength(1);
    expect(api.compras[0].cuerpo).toEqual({ productos: [{ productoId: IDS.aceite, cantidad: 2 }], entrega: ENTREGA });
    await page.getByRole('link', { name: 'Ver comprobante' }).click();
    await expect(page.getByRole('heading', { name: 'Comprobante de compra' })).toBeVisible();
    await expect(page.getByRole('row', { name: /Aceite de prueba/ })).toContainText('10 %');
    await expect(page.getByText('Total confirmado: $18.000')).toBeVisible();
    await expect(page.getByText(/sin validez tributaria/)).toBeVisible();
    await capturar(page, testInfo, 'cliente-comprobante-simulado');
    await page.getByRole('link', { name: 'Volver al detalle de la orden' }).click();
    await expect(page.getByRole('region', { name: 'Datos de entrega' })).toContainText(ENTREGA.direccion);
    await page.getByRole('navigation').getByRole('link', { name: 'Mis órdenes' }).click();
    await expect(page.getByRole('link', { name: 'Orden ' + api.compras[0].clave })).toBeVisible();
    await page.getByRole('link', { name: 'Carrito conectado' }).click();
    await expect(page.getByText('Tu carrito está vacío')).toBeVisible();
});

test('CLIENTE · reintenta con la misma clave y el mismo despacho', async ({ page, api }) => {
    api.fallarPrimeraCompra = true;
    await prepararCompra(page);
    await page.getByRole('button', { name: 'Confirmar compra' }).click();
    await expect(page.getByText('La orden sigue sin confirmación. Puedes volver a consultarla.')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Compra pendiente de verificación' })).toBeVisible();
    await page.getByRole('button', { name: 'Reintentar la misma compra' }).click();
    await expect(page.getByRole('heading', { name: 'Orden confirmada' })).toBeVisible();
    expect(api.compras).toHaveLength(2);
    expect(api.compras[0]).toEqual(api.compras[1]);
    expect(api.ordenes.filter((orden) => orden.id === api.compras[0].clave)).toHaveLength(1);
    expect(api.productos.find((producto) => producto.id === IDS.aceite).stock).toBe(2);
});

test('CLIENTE · conserva el carrito si el servidor rechaza el stock', async ({ page, api }) => {
    api.stockInsuficiente = true;
    await prepararCompra(page);
    await page.getByRole('button', { name: 'Confirmar compra' }).click();
    await expect(page.getByRole('alert')).toContainText('Stock insuficiente para la cantidad solicitada.');
    await expect(page.getByRole('link', { name: 'Ver comprobante' })).toHaveCount(0);
    expect(api.ordenes).toHaveLength(2);
    await page.getByRole('link', { name: 'Carrito conectado' }).click();
    await expect(page.getByText('Cantidad total: 2')).toBeVisible();
});

test('CLIENTE · solo ve órdenes propias y no entra al panel administrativo', async ({ page }) => {
    await iniciarSesion(page, 'CLIENTE');
    await page.getByRole('navigation').getByRole('link', { name: 'Mis órdenes' }).click();
    await expect(page.getByRole('link', { name: 'Orden ' + IDS.orden, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Orden ' + IDS.ordenAjena, exact: true })).toHaveCount(0);
    await page.goto(RUTAS.ordenes + '/' + IDS.ordenAjena + '/boleta');
    await expect(page.getByRole('alert')).toHaveText('Orden no encontrada.');
    await expect(page.getByRole('table')).toHaveCount(0);
    await page.goto(RUTAS.admin);
    await expect(page.getByRole('alert')).toContainText('Tu rol no tiene permiso');
});

test('CLIENTE · reporta una incidencia para una orden propia', async ({ page }, testInfo) => {
    await iniciarSesion(page, 'CLIENTE');
    await page.getByRole('link', { name: 'Mis incidencias' }).click();
    await expect(page.getByText('Seguimiento inicial')).toBeVisible();
    await page.getByRole('link', { name: 'Nueva incidencia' }).click();
    const orden = page.getByRole('combobox');
    await expect(orden.locator('option[value="' + IDS.ordenAjena + '"]')).toHaveCount(0);
    await orden.selectOption(IDS.orden);
    await page.getByPlaceholder('Ej: Producto recibido con problemas').fill('Consulta de entrega');
    await page.getByPlaceholder('Describe el problema con el mayor detalle posible.').fill('Solicito confirmar el despacho.');
    await page.getByRole('button', { name: 'Enviar incidencia' }).click();
    await expect(page.getByRole('row', { name: /Consulta de entrega/ })).toContainText('Pendiente');
    await capturar(page, testInfo, 'cliente-incidencia-simulada');
});

test('CLIENTE · actualiza el perfil y valida el formulario de contacto', async ({ page, api }) => {
    await iniciarSesion(page, 'CLIENTE');
    await page.getByRole('navigation').getByRole('link', { name: CUENTAS.CLIENTE.nombre }).click();
    const comuna = page.getByPlaceholder('Ej: Puente Alto');
    await comuna.fill('Providencia');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Perfil actualizado correctamente.')).toBeVisible();
    await page.reload();
    await expect(comuna).toHaveValue('Providencia');

    await page.getByRole('navigation').getByRole('link', { name: 'Contacto' }).click();
    await page.getByPlaceholder('Tu nombre').fill('Camila Demo');
    await page.getByPlaceholder('ejemplo@duoc.cl').fill('contacto@example.test');
    await page.getByPlaceholder('Escribe tu mensaje aquí...').fill('Consulta ficticia de mantención.');
    await page.getByRole('button', { name: 'Enviar mensaje' }).click();
    await expect(page.getByText(/Utiliza un correo @duoc.cl/)).toBeVisible();
    expect(api.mensajes).toHaveLength(0);
    await page.getByPlaceholder('ejemplo@duoc.cl').fill('autocare.e2e@gmail.com');
    await page.getByRole('button', { name: 'Enviar mensaje' }).click();
    await expect(page.getByText('Tu mensaje fue enviado correctamente.')).toBeVisible();
    expect(api.mensajes).toHaveLength(1);
});

test('CLIENTE · elimina un producto del carrito', async ({ page }) => {
    await iniciarSesion(page, 'CLIENTE');
    await page.getByRole('button', { name: 'Agregar ' + FILTRO + ' al carrito conectado' }).click();
    await page.getByRole('link', { name: 'Carrito conectado' }).click();
    await expect(page.getByText(FILTRO, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Tu carrito está vacío')).toBeVisible();
});
