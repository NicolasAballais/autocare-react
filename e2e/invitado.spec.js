import { capturar, expect, test } from './api-simulada.js';
import { ACEITE, CLAVE_FICTICIA, CUENTAS, ENTREGA, FILTRO, IDS, RUTAS } from './datos.js';

test('INVITADO · explora catálogo, filtros, categorías, ofertas y detalle', async ({ page }, testInfo) => {
    await page.goto(RUTAS.catalogo);
    await expect(page.getByText('2 productos disponibles')).toBeVisible();
    await page.getByLabel('Ordenar productos').selectOption('precio-menor');
    const productos = page.getByRole('heading', { name: /Aceite de prueba|Filtro de prueba/ });
    await expect(productos).toHaveText([FILTRO, ACEITE]);
    const buscar = page.getByPlaceholder('Buscar productos por nombre, categoría o descripción...');
    await buscar.fill('Filtro');
    await expect(page.getByText(FILTRO, { exact: true })).toBeVisible();
    await expect(page.getByText(ACEITE, { exact: true })).toHaveCount(0);
    await buscar.fill('ningún resultado 123');
    await expect(page.getByText('0 productos disponibles')).toBeVisible();
    await page.getByRole('button', { name: 'Limpiar filtros' }).click();
    await page.getByRole('button', { name: 'TEST-Aceites' }).click();
    await expect(page.getByRole('button', { name: 'TEST-Aceites' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('1 productos disponibles')).toBeVisible();
    await capturar(page, testInfo, 'invitado-filtro-catalogo-simulado');

    const nav = page.getByRole('navigation');
    await nav.getByRole('link', { name: 'Categorías' }).click();
    await expect(page.getByRole('heading', { name: 'TEST-Aceites', level: 2 })).toBeVisible();
    await nav.getByRole('link', { name: 'Ofertas' }).click();
    await expect(page.getByText(ACEITE, { exact: true })).toBeVisible();
    await expect(page.getByText(FILTRO, { exact: true })).toHaveCount(0);
    await page.locator('a[href="' + RUTAS.catalogo + '/' + IDS.aceite + '"]').click();
    await expect(page.getByRole('heading', { name: ACEITE })).toBeVisible();
    await expect(page.getByText('Aceite sintético para motor')).toBeVisible();
});

test('INVITADO · arma un carrito conectado y debe iniciar sesión para comprar', async ({ page, api }) => {
    await page.goto(RUTAS.catalogo);
    await page.getByRole('button', { name: 'Agregar ' + ACEITE + ' al carrito conectado' }).click();
    await page.getByRole('link', { name: 'Carrito conectado' }).click();
    await expect(page.getByText('Cantidad total: 1')).toBeVisible();
    await page.getByRole('link', { name: 'Continuar al checkout' }).click();
    await expect(page.getByRole('heading', { name: 'Iniciar sesión conectada' })).toBeVisible();
    expect(api.compras).toHaveLength(0);
    await page.goto(RUTAS.admin);
    await expect(page).toHaveURL(new RegExp(RUTAS.login + '$'));

    await page.getByLabel('Correo electrónico').fill(CUENTAS.CLIENTE.correo);
    await page.getByLabel('Contraseña', { exact: true }).fill(CLAVE_FICTICIA);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('alert')).toContainText('Tu rol no tiene permiso');
    await page.getByRole('link', { name: 'Carrito conectado' }).click();
    await page.getByRole('button', { name: 'Revisar importación del carrito sin sesión' }).click();
    await page.getByRole('button', { name: 'Confirmar importación' }).click();
    await expect(page.getByText('Cantidad total: 1')).toBeVisible();
});

test('INVITADO · valida confirmación de contraseña y crea una cuenta simulada', async ({ page }) => {
    await page.goto(RUTAS.registro);
    await page.getByLabel('Nombre', { exact: true }).fill('Paula');
    await page.getByLabel('Apellido', { exact: true }).fill('Demo');
    await page.getByLabel('Correo electrónico').fill('paula@example.test');
    await page.getByLabel('Contraseña', { exact: true }).fill(CLAVE_FICTICIA);
    await page.getByLabel('Confirmar contraseña').fill('ClaveDistinta123');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText(/contraseñas no coinciden/i)).toBeVisible();
    await page.getByLabel('Confirmar contraseña').fill(CLAVE_FICTICIA);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText(/Cuenta creada/)).toBeVisible();
});

test('INVITADO · compra local con rechazo simulado y acceso a boleta de invitado', async ({ page, api }, testInfo) => {
    await page.goto('/');
    const inicio = page.getByPlaceholder('Busca repuestos, aceites, accesorios...');
    await inicio.fill('Aceite Sintético');
    await inicio.press('Enter');
    await expect(page.getByText('Aceite Sintético 5W-30', { exact: true })).toBeVisible();
    await expect(page.getByText('Kit Detailing Básico', { exact: true })).toHaveCount(0);
    await page.getByRole('link', { name: 'Ver detalle' }).click();
    await page.getByRole('button', { name: /agregar al carrito/i }).click();
    await page.getByRole('navigation').locator('a[href="/carrito"]').click();
    await page.getByRole('link', { name: 'Continuar al checkout' }).click();
    await page.getByLabel('Nombre completo').fill(ENTREGA.nombre);
    await page.getByLabel('Correo electrónico').fill(ENTREGA.correo);
    await page.getByLabel('Teléfono').fill(ENTREGA.telefono);
    await page.getByLabel('Comuna').fill(ENTREGA.comuna);
    await page.getByLabel('Dirección de entrega').fill(ENTREGA.direccion);
    await page.getByLabel('Método de entrega').selectOption(ENTREGA.tipo);
    await page.getByRole('button', { name: 'Continuar al pago' }).click();

    await page.getByRole('radio', { name: 'Tarjeta de crédito' }).check();
    await page.getByRole('button', { name: 'Pagar' }).click();
    await expect(page.getByText('Pago rechazado', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Volver a intentar el pago' }).click();
    await page.getByRole('radio', { name: 'Tarjeta de débito' }).check();
    await page.getByRole('button', { name: 'Pagar' }).click();
    await expect(page.getByRole('heading', { name: 'Compra realizada con éxito' })).toBeVisible();
    await page.getByRole('link', { name: 'Ver boleta' }).click();
    await expect(page.getByRole('heading', { name: 'Boleta AutoCarePro' })).toBeVisible();
    await capturar(page, testInfo, 'invitado-boleta-local');
    expect(api.compras).toHaveLength(0);
});

test('INVITADO · consulta el artículo y la información de la tienda', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await nav.getByRole('link', { name: 'Nosotros' }).click();
    await expect(page.getByRole('heading', { name: 'Sobre Nosotros' })).toBeVisible();
    await nav.getByRole('link', { name: 'Blog', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Blog AutoCarePro' })).toBeVisible();
    const tarjeta = page.locator('main .card').first();
    const titulo = await tarjeta.getByRole('heading').textContent();
    await tarjeta.getByRole('link', { name: 'Leer artículo' }).click();
    await expect(page.getByRole('heading', { name: titulo.trim() })).toBeVisible();
    await expect(page).toHaveURL(/\/blog\/\d+$/);
});