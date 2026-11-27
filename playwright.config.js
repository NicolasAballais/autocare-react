import { defineConfig } from '@playwright/test';

// Los workers cargan esta configuración en otro proceso.
if (process.argv.includes('--headed')) process.env.AUTOCARE_E2E_VISUAL = '1';
const visual = process.env.AUTOCARE_E2E_VISUAL === '1';
const soloListar = process.argv.includes('--list');
const origen = 'http://127.0.0.1:4178';
const aislado = process.env.AUTOCARE_NAVEGADOR_AISLADO === '1';
const modo = visual ? 'visual' : 'automatico';

export default defineConfig({
    testDir: './e2e',
    outputDir: 'test-results/' + modo,
    forbidOnly: true,
    retries: 0,
    workers: visual ? 1 : 2,
    timeout: visual ? 90000 : 30000,
    reporter: soloListar ? [['list']] : [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report/' + modo }],
        ['json', { outputFile: 'test-results/' + modo + '/resultados-playwright.json' }]
    ],
    use: {
        baseURL: origen,
        channel: 'chrome',
        headless: !visual,
        locale: 'es-CL',
        actionTimeout: 10000,
        navigationTimeout: 15000,
        serviceWorkers: 'block',
        viewport: { width: 1366, height: 900 },
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        launchOptions: {
            slowMo: visual ? 250 : 0,
            args: aislado ? ['--disable-gpu', '--disable-software-rasterizer'] : []
        }
    },
    webServer: {
        command: 'node node_modules/vite/bin/vite.js --config e2e/vite.config.js',
        url: origen,
        reuseExistingServer: false,
        timeout: 30000
    }
});
