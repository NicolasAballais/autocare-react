import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CarritoProvider } from '../context/CarritoContext';
import { RUTA_CATALOGO_CONECTADO } from '../context/catalogo';
import Carrito from '../pages/Carrito';
import CatalogoConectado from '../pages/CatalogoConectado';
import Categorias from '../pages/Categorias';
import Checkout from '../pages/Checkout';
import CompraExitosa from '../pages/CompraExitosa';
import DetalleProducto from '../pages/DetalleProducto';
import Ofertas from '../pages/Ofertas';
import Pago from '../pages/Pago';
import Productos from '../pages/Productos';
import categoriasLocales from '../data/categorias.json';
import productosLocales from '../data/productos.json';

const categoriasApi = categoriasLocales.map((categoria) => ({
    ...categoria,
    id: `66000000000000000000000${categoria.id}`
}));
const categoriasApiOrdenadas = [...categoriasApi].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es-CL'));

const productosApi = productosLocales.map((producto, indice) => ({
    ...producto,
    id: `67000000000000000000000${producto.id}`,
    categoriaId: categoriasApi.find((categoria) => categoria.nombre === producto.categoria).id,
    precioFinal: [28000, 21250, 15000, 10800][indice]
}));

function simularCatalogo(fetchSimulado, productos = productosApi, categorias = categoriasApi) {
    fetchSimulado.and.callFake(async (url) => {
        if (url === '/api/v1/productos') return Response.json(productos);
        if (url === '/api/v1/categorias') return Response.json(categorias);
        throw new Error(`Ruta inesperada: ${url}`);
    });
}

function renderizar(ruta = RUTA_CATALOGO_CONECTADO) {
    return render(
        <MemoryRouter initialEntries={[ruta]}>
            <CarritoProvider>
                <Navbar />
                <Routes>
                    <Route path="/productos" element={<Productos />} />
                    <Route path="/productos/:id" element={<DetalleProducto />} />
                    <Route path="/categorias" element={<Categorias />} />
                    <Route path="/carrito" element={<Carrito />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/pago" element={<Pago />} />
                    <Route path="/compra-exitosa" element={<CompraExitosa />} />
                    <Route path={RUTA_CATALOGO_CONECTADO} element={<CatalogoConectado />}>
                        <Route index element={<Productos />} />
                        <Route path="categorias" element={<Categorias />} />
                        <Route path="ofertas" element={<Ofertas />} />
                        <Route path=":id" element={<DetalleProducto />} />
                    </Route>
                </Routes>
            </CarritoProvider>
        </MemoryRouter>
    );
}

describe('Catálogo conectado', () => {
    let fetchSimulado;

    beforeEach(() => {
        localStorage.clear();
        fetchSimulado = spyOn(window, 'fetch');
        simularCatalogo(fetchSimulado);
    });

    afterEach(() => {
        cleanup();
        localStorage.clear();
    });

    it('muestra la carga y después los productos y categorías de las dos consultas GET', async () => {
        const catalogoLocalGuardado = JSON.stringify([{ id: 7, nombre: 'Producto local guardado' }]);
        localStorage.setItem('productosAutoCare', catalogoLocalGuardado);
        renderizar();

        expect(screen.getByRole('status').textContent).toContain('Cargando catálogo conectado');
        expect(screen.queryByText(productosApi[0].nombre)).toBeNull();
        expect(await screen.findByText('4 productos disponibles')).toBeTruthy();

        for (const producto of productosApi) {
            expect(screen.getByText(producto.nombre)).toBeTruthy();
        }
        for (const categoria of categoriasApi) {
            expect(screen.getByRole('button', { name: categoria.nombre })).toBeTruthy();
        }
        expect(fetchSimulado.calls.allArgs().map(([url, opciones]) => [url, opciones.method])).toEqual([
            ['/api/v1/productos', 'GET'], ['/api/v1/categorias', 'GET']
        ]);
        expect(localStorage.getItem('productosAutoCare')).toBe(catalogoLocalGuardado);
        expect(localStorage.getItem('categoriasAutoCare')).toBeNull();
    });

    it('combina búsqueda con filtros por ObjectId y permite limpiar y alternar filtros', async () => {
        renderizar(`${RUTA_CATALOGO_CONECTADO}?buscar=preventivo&categoria=${categoriasApi[0].id}`);
        expect(await screen.findByText(productosApi[0].nombre)).toBeTruthy();
        expect(screen.queryByText(productosApi[3].nombre)).toBeNull();

        const filtroAceites = screen.getByRole('button', { name: categoriasApi[0].nombre });
        expect(filtroAceites.getAttribute('aria-pressed')).toBe('true');
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ampolleta' } });
        expect(screen.getByText('No se encontraron productos con los filtros seleccionados.')).toBeTruthy();
        fireEvent.click(filtroAceites);
        expect(screen.getByText(productosApi[2].nombre)).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
        expect(screen.getByText('4 productos disponibles')).toBeTruthy();
    });

    it('muestra el precio final de la API y lo usa para ordenar', async () => {
        simularCatalogo(fetchSimulado, [{ ...productosApi[0], precioFinal: 9990 }, ...productosApi.slice(1)]);
        renderizar();
        expect(await screen.findByText('$9.990')).toBeTruthy();
        expect(screen.getByText('$35.000')).toBeTruthy();
        expect(screen.getByText('-20%')).toBeTruthy();

        fireEvent.change(screen.getByRole('combobox', { name: 'Ordenar productos' }), {
            target: { value: 'precio-menor' }
        });
        const nombres = screen.getAllByRole('img').map((imagen) => imagen.alt);
        expect(nombres).toEqual([0, 3, 2, 1].map((indice) => productosApi[indice].nombre));
    });

    it('abre el detalle por ObjectId y protege el carrito local en ambas pantallas', async () => {
        const carritoLocal = [{ ...productosLocales[1], cantidad: 2 }];
        localStorage.setItem('carritoAutoCare', JSON.stringify(carritoLocal));
        renderizar();
        await screen.findByText('4 productos disponibles');

        const [producto] = productosApi;
        fireEvent.click(screen.getByRole('button', { name: `Agregar ${producto.nombre} al carrito conectado` }));
        const enlace = screen.getAllByRole('link', { name: 'Ver detalle' })[0];
        expect(enlace.getAttribute('href')).toBe(`${RUTA_CATALOGO_CONECTADO}/${producto.id}`);
        fireEvent.click(enlace);

        expect(screen.getByRole('heading', { name: producto.nombre })).toBeTruthy();
        expect(screen.getByRole('img', { name: producto.nombre }).getAttribute('src')).toBe(producto.imagen);
        expect(screen.getByText(/Stock disponible:/).parentElement.textContent).toContain(String(producto.stock));
        fireEvent.click(screen.getByRole('button', { name: 'Agregar al carrito conectado' }));
        expect(JSON.parse(localStorage.getItem('carritoAutoCare'))).toEqual(carritoLocal);
        expect(JSON.parse(localStorage.getItem('carritoConectadoAutoCare')).carrito).toEqual([
            jasmine.objectContaining({ id: producto.id, cantidad: 2, precio: producto.precioFinal })
        ]);
        expect(screen.getByRole('link', { name: 'Volver' }).getAttribute('href')).toBe(RUTA_CATALOGO_CONECTADO);
        expect(fetchSimulado.calls.count()).toBe(2);
    });

    it('mantiene la navegación de categorías y ofertas en la vista conectada', async () => {
        renderizar();
        await screen.findByText('4 productos disponibles');

        const navegacion = within(screen.getByRole('navigation'));
        fireEvent.click(navegacion.getByRole('link', { name: 'Categorías' }));
        expect(screen.getByRole('heading', { name: 'Categorías' })).toBeTruthy();
        const categoria = screen.getByRole('heading', { name: categoriasApi[2].nombre });
        fireEvent.click(within(categoria.parentElement).getByRole('button', { name: 'Ver productos' }));
        expect(screen.getByRole('link', { name: 'Ver detalle' }).getAttribute('href'))
            .toBe(`${RUTA_CATALOGO_CONECTADO}/${productosApi[2].id}`);

        fireEvent.click(navegacion.getByRole('link', { name: 'Ofertas' }));
        expect(screen.getByRole('heading', { name: 'Ofertas' })).toBeTruthy();
        expect(screen.queryByText(productosApi[2].nombre)).toBeNull();
        expect(screen.getAllByRole('link', { name: 'Ver producto' }).length).toBe(3);
        expect(fetchSimulado.calls.count()).toBe(2);
    });

    it('muestra catálogo vacío sin usar los productos locales', async () => {
        simularCatalogo(fetchSimulado, [], []);
        renderizar();
        expect(await screen.findByText('El catálogo conectado está vacío.')).toBeTruthy();
        expect(screen.queryByText(productosLocales[0].nombre)).toBeNull();
    });

    it('abre la primera categoría conectada con productos y permite elegir Accesorios', async () => {
        simularCatalogo(fetchSimulado, productosApi, categoriasApiOrdenadas);
        renderizar(`${RUTA_CATALOGO_CONECTADO}/categorias`);

        expect(await screen.findByRole('heading', { level: 2, name: 'Aceites y Filtros' })).toBeTruthy();
        expect(screen.getByText(productosApi[0].nombre)).toBeTruthy();
        expect(screen.getByText(productosApi[3].nombre)).toBeTruthy();

        const accesorios = screen.getByRole('heading', { level: 4, name: 'Accesorios' });
        const boton = within(accesorios.parentElement).getByRole('button', { name: 'Ver productos' });
        fireEvent.click(boton);

        expect(boton.getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByRole('heading', { level: 2, name: 'Accesorios' })).toBeTruthy();
        expect(screen.getByText('No existen productos disponibles en esta categoría.')).toBeTruthy();
    });

    it('respeta Accesorios cuando está seleccionado en la URL conectada', async () => {
        simularCatalogo(fetchSimulado, productosApi, categoriasApiOrdenadas);
        const accesorios = categoriasApiOrdenadas[0];
        renderizar(`${RUTA_CATALOGO_CONECTADO}/categorias?categoria=${accesorios.id}`);

        expect(await screen.findByRole('heading', { level: 2, name: 'Accesorios' })).toBeTruthy();
        expect(screen.getByText('No existen productos disponibles en esta categoría.')).toBeTruthy();
    });

    it('mantiene como selección inicial la primera categoría guardada en el catálogo local', () => {
        const categoriasGuardadas = [...categoriasLocales].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es-CL'));
        localStorage.setItem('categoriasAutoCare', JSON.stringify(categoriasGuardadas));
        renderizar('/categorias');

        expect(screen.getByRole('heading', { level: 2, name: 'Accesorios' })).toBeTruthy();
        expect(screen.getByText('No existen productos disponibles en esta categoría.')).toBeTruthy();
        expect(fetchSimulado).not.toHaveBeenCalled();
    });

    it('muestra el error de conexión, mantiene los datos locales aparte y permite reintentar', async () => {
        fetchSimulado.and.rejectWith(new TypeError('Failed to fetch'));
        renderizar();

        expect((await screen.findByRole('alert')).textContent).toContain('No se pudo conectar con la API.');
        expect(screen.queryByText(productosLocales[0].nombre)).toBeNull();

        simularCatalogo(fetchSimulado);
        fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
        expect(await screen.findByText('4 productos disponibles')).toBeTruthy();
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('muestra producto inexistente si el enlace conectado contiene un ID local', async () => {
        renderizar(`${RUTA_CATALOGO_CONECTADO}/${productosLocales[0].id}`);
        expect(await screen.findByRole('heading', { name: 'Producto no encontrado' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Volver al catálogo' }).getAttribute('href'))
            .toBe(RUTA_CATALOGO_CONECTADO);
    });

    it('completa la compra simulada, registra la orden y descuenta stock sin consultar la API', () => {
        renderizar('/productos');
        expect(screen.getByRole('link', { name: 'Ver catálogo conectado' }).getAttribute('href'))
            .toBe(RUTA_CATALOGO_CONECTADO);
        fireEvent.click(screen.getAllByRole('link', { name: 'Ver detalle' })[0]);
        fireEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }));

        expect(JSON.parse(localStorage.getItem('carritoAutoCare'))[0]).toEqual(jasmine.objectContaining({
            id: 1, cantidad: 1, precio: 28000
        }));
        const carrito = screen.getByRole('navigation').querySelector('a[href="/carrito"]');
        fireEvent.click(carrito);
        fireEvent.click(screen.getByRole('link', { name: 'Continuar al checkout' }));
        expect(screen.getByRole('heading', { name: 'Checkout' })).toBeTruthy();

        const datosCliente = {
            'Nombre completo': 'Cliente de prueba',
            'Correo electrónico': 'cliente@example.test',
            'Teléfono': '900000000',
            'Comuna': 'Santiago',
            'Dirección de entrega': 'Calle de prueba 123',
            'Método de entrega': 'Envío estándar'
        };
        for (const [etiqueta, value] of Object.entries(datosCliente)) {
            fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } });
        }
        fireEvent.click(screen.getByRole('button', { name: 'Continuar al pago' }));
        fireEvent.click(screen.getByRole('radio', { name: 'Tarjeta de débito' }));
        fireEvent.click(screen.getByRole('button', { name: 'Pagar' }));

        expect(screen.getByRole('heading', { name: 'Compra realizada con éxito' })).toBeTruthy();
        expect(JSON.parse(localStorage.getItem('carritoAutoCare'))).toEqual([]);
        const productoComprado = JSON.parse(localStorage.getItem('productosAutoCare')).find((producto) => producto.id === 1);
        expect(productoComprado.stock).toBe(productosLocales[0].stock - 1);
        const orden = JSON.parse(localStorage.getItem('ordenesAutoCare')).at(-1);
        expect(orden.total).toBe(28000);
        expect(fetchSimulado).not.toHaveBeenCalled();
    });
});
