import { capturar, expect, iniciarSesion, test } from './api-simulada.js';
import { ACEITE, IDS, RUTAS } from './datos.js';

test('VENDEDOR · consulta órdenes y productos sin acciones de compra ni datos de despacho', async ({ page }, testInfo) => {
    await iniciarSesion(page, 'VENDEDOR');
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link')).toHaveText(['AutoCarePro', 'Productos', 'Órdenes']);
    await expect(page.getByRole('link', { name: 'Orden ' + IDS.ordenAjena })).toBeVisible();
    await page.getByRole('link', { name: 'Orden ' + IDS.orden, exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Orden ' + IDS.orden })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Datos de entrega' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Ver comprobante' }).click();
    await expect(page.getByText('Total confirmado: $9.000')).toBeVisible();
    await capturar(page, testInfo, 'vendedor-comprobante-simulado');

    await nav.getByRole('link', { name: 'Productos' }).click();
    await expect(page.getByText(ACEITE, { exact: true })).toBeVisible();
    await page.locator('a[href="' + RUTAS.catalogo + '/' + IDS.aceite + '"]').click();
    await expect(page.getByRole('heading', { name: ACEITE })).toBeVisible();
    await expect(page.getByRole('button', { name: /agregar.*carrito/i })).toHaveCount(0);
});

test('VENDEDOR · rechaza rutas ajenas al rol y vuelve al login al cerrar sesión', async ({ page }) => {
    await iniciarSesion(page, 'VENDEDOR');
    for (const ruta of [RUTAS.admin, RUTAS.admin + '/reportes', RUTAS.carrito + '/checkout',
        RUTAS.catalogo + '/perfil', RUTAS.incidencias, RUTAS.catalogo + '/contacto']) {
        await page.goto(ruta);
        await expect(page.getByRole('alert')).toContainText('Tu rol no tiene permiso');
    }
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page.getByRole('heading', { name: 'Iniciar sesión conectada' })).toBeVisible();
    await page.goto(RUTAS.ordenes);
    await expect(page).toHaveURL(new RegExp(RUTAS.login + '$'));
});
