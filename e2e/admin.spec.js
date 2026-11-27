import { capturar, expect, iniciarSesion, test } from './api-simulada.js';
import { CLAVE_FICTICIA, ENTREGA, FILTRO, IDS, RUTAS } from './datos.js';

test('ADMIN · gestiona categorías y respeta el conflicto de productos asociados', async ({ page }) => {
    await iniciarSesion(page, 'ADMIN');
    await page.getByRole('link', { name: 'Administrar categorías' }).click();
    const existente = page.getByRole('row', { name: /TEST-Aceites/ });
    page.once('dialog', (dialogo) => dialogo.accept());
    await existente.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByRole('alert')).toContainText('La categoría tiene productos asociados.');
    await expect(existente).toBeVisible();

    await page.getByRole('button', { name: 'Crear categoría' }).click();
    await expect(page.getByRole('alert')).toContainText(/nombre|obligatorio/i);
    await page.getByLabel('Nombre', { exact: true }).fill('TEST-Limpieza');
    await page.getByRole('button', { name: 'Crear categoría' }).click();

    const nueva = page.getByRole('row', { name: /TEST-Limpieza/ });
    await nueva.getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Nombre', { exact: true }).fill('TEST-Detallado');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    const editada = page.getByRole('row', { name: /TEST-Detallado/ });
    await expect(editada).toBeVisible();
    page.once('dialog', (dialogo) => dialogo.accept());
    await editada.getByRole('button', { name: 'Eliminar' }).click();
    await expect(editada).toHaveCount(0);
});

test('ADMIN · valida stock, crea, edita y elimina un producto temporal', async ({ page }, testInfo) => {
    await iniciarSesion(page, 'ADMIN');
    await page.getByRole('link', { name: 'Administrar productos' }).click();
    await page.getByRole('link', { name: 'Nuevo producto' }).click();
    await page.getByLabel('Código', { exact: true }).fill('TEST-PROD-01');
    await page.getByLabel('Nombre', { exact: true }).fill('Producto temporal de prueba');
    await page.getByLabel('Precio', { exact: true }).fill('12000');
    await page.getByLabel('Stock', { exact: true }).fill('-1');
    await page.getByLabel('Categoría', { exact: true }).selectOption(IDS.aceites);
    await page.getByRole('button', { name: 'Guardar producto' }).click();
    await expect(page.getByRole('alert')).toContainText('Ingresa un número entero válido');
    await page.getByLabel('Stock', { exact: true }).fill('3');
    await page.getByRole('button', { name: 'Guardar producto' }).click();

    const producto = page.getByRole('row', { name: /Producto temporal de prueba/ });
    await expect(producto).toContainText('$12.000');
    await producto.getByRole('link', { name: 'Editar' }).click();
    await expect(page.getByLabel('Stock', { exact: true })).toHaveValue('3');
    await page.getByLabel('Precio', { exact: true }).fill('13000');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(producto).toContainText('$13.000');
    await capturar(page, testInfo, 'admin-producto-temporal-simulado');

    page.once('dialog', (dialogo) => dialogo.accept());
    await producto.getByRole('button', { name: 'Eliminar' }).click();
    await expect(producto).toHaveCount(0);
});

test('ADMIN · consulta y edita clientes y revisa su historial', async ({ page }) => {
    await iniciarSesion(page, 'ADMIN');
    await page.getByRole('link', { name: 'Administrar usuarios' }).click();
    const camila = page.getByRole('row', { name: /Camila Demo/ });
    await camila.getByRole('link', { name: /ver/i }).click();
    await expect(page.getByRole('row', { name: new RegExp(IDS.orden) })).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(IDS.ordenAjena) })).toHaveCount(0);

    await page.goto(RUTAS.admin + '/usuarios');
    await page.getByRole('link', { name: 'Nuevo usuario' }).click();
    await page.getByLabel('Nombre', { exact: true }).fill('Ana');
    await page.getByLabel('Apellido', { exact: true }).fill('Temporal');
    await page.getByLabel('Correo', { exact: true }).fill('ana.temporal@example.test');
    await page.getByLabel('Contraseña', { exact: true }).fill(CLAVE_FICTICIA);
    await page.getByRole('button', { name: 'Crear usuario' }).click();

    await page.getByRole('row', { name: /Ana Temporal/ }).getByRole('link', { name: 'Editar' }).click();
    await page.locator('input[name="comuna"]').fill('Ñuñoa');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Ñuñoa', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Ñuñoa', { exact: true })).toBeVisible();
});

test('ADMIN · despacha órdenes y resuelve incidencias desde sus listados', async ({ page }, testInfo) => {
    await iniciarSesion(page, 'ADMIN');
    await page.goto(RUTAS.admin + '/ordenes');
    const orden = page.getByRole('row', { name: new RegExp(IDS.orden) });
    await expect(orden).toContainText('Procesando');
    page.once('dialog', (dialogo) => dialogo.accept());
    await orden.getByRole('button', { name: 'Marcar enviado' }).click();
    await expect(orden).toContainText('Enviado');
    await expect(orden.getByRole('button', { name: 'Marcar enviado' })).toHaveCount(0);
    await orden.getByRole('link', { name: /ver/i }).click();
    await expect(page.getByRole('region', { name: 'Datos de entrega' })).toContainText(ENTREGA.direccion);
    await capturar(page, testInfo, 'admin-despacho-simulado');

    await page.goto(RUTAS.admin + '/incidencias');
    const incidencia = page.getByRole('row', { name: /Seguimiento inicial/ });
    await expect(incidencia).toContainText('Pendiente');
    page.once('dialog', (dialogo) => dialogo.accept());
    await incidencia.getByRole('button', { name: 'Marcar resuelta' }).click();
    await expect(incidencia).toContainText('Resuelta');
    await expect(incidencia.getByRole('button', { name: 'Marcar resuelta' })).toHaveCount(0);
});

test('ADMIN · lee stock crítico y los totales del reporte', async ({ page }, testInfo) => {
    await iniciarSesion(page, 'ADMIN');
    await page.goto(RUTAS.admin + '/notificaciones');
    await expect(page.getByText(FILTRO, { exact: true })).toBeVisible();
    await expect(page.getByText('Stock crítico: 1')).toBeVisible();
    await page.goto(RUTAS.admin + '/reportes');
    await expect(page.getByText('Total de compras simuladas')).toBeVisible();
    await expect(page.getByText('$18.000', { exact: true })).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(FILTRO) })).toContainText(/crítico/i);
    await capturar(page, testInfo, 'admin-reporte-simulado');
});
