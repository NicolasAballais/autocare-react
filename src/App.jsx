import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

import Footer from './components/Footer';
import Navbar from './components/Navbar';
import RutaAdmin from './components/RutaAdmin';
import RutaConectada from './components/RutaConectada';

import Index from './pages/Index';
import Blog from './pages/Blog';
import Login from './pages/Login';
import Nosotros from './pages/Nosotros';
import Register from './pages/Register';
import Productos from './pages/Productos';
import Contacto from './pages/Contacto';
import DetalleProducto from './pages/DetalleProducto';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import Pago from './pages/Pago';
import CompraExitosa from './pages/CompraExitosa';
import PagoError from './pages/PagoError';
import Ordenes from './pages/Ordenes';
import DetalleOrden from './pages/DetalleOrden';
import Boleta from './pages/Boleta';

import AdminProductos from './pages/AdminProductos';
import AdminProductoNuevo from './pages/AdminProductoNuevo';
import AdminProductoEditar from './pages/AdminProductoEditar';
import AdminOrdenes from './pages/AdminOrdenes';
import AdminNotificaciones from './pages/AdminNotificaciones';
import AdminPanel from './pages/AdminPanel';
import AdminIncidencias from './pages/AdminIncidencias';

import NuevaIncidencia from './pages/NuevaIncidencia';
import Incidencias from './pages/Incidencias';

import Perfil from './pages/Perfil';
import Categorias from './pages/Categorias';

import AdminCategorias from './pages/AdminCategorias';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminUsuarioDetalle from './pages/AdminUsuarioDetalle';
import AdminUsuarioEditar from './pages/AdminUsuarioEditar';
import Ofertas from './pages/Ofertas';
import AdminReportes from './pages/AdminReportes';
import AdminUsuarioNuevo from './pages/AdminUsuarioNuevo';
import BlogDetalle from './pages/BlogDetalle';
import CatalogoConectado from './pages/CatalogoConectado';
import RevisionCarritoConectado from './pages/RevisionCarritoConectado';
import CompraConectada from './pages/CompraConectada';
import OrdenesConectadas from './pages/OrdenesConectadas';
import { RUTA_ADMIN_CONECTADA, RUTA_CARRITO_CONECTADO, RUTA_CATALOGO_CONECTADO, RUTA_CHECKOUT_CONECTADO,
    RUTA_COMPRA_CONECTADA, RUTA_LOGIN_CONECTADO, RUTA_ORDENES_CONECTADAS, RUTA_PERFIL_CONECTADO,
    RUTA_REGISTRO_CONECTADO } from './context/catalogo';

import { useSesionConectada } from './context/sesionConectada.js';
import { crearAdminCatalogoApi } from './services/adminCatalogoApi.js';

const ROLES_TIENDA = ['ADMIN', 'CLIENTE'];
const PAGINAS_CATALOGO_ADMIN = [AdminPanel, AdminProductos, AdminProductoNuevo, AdminProductoEditar, AdminCategorias];
const PAGINAS_ADMIN = [
    ['', AdminPanel], ['/productos', AdminProductos], ['/productos/nuevo', AdminProductoNuevo],
    ['/productos/editar/:id', AdminProductoEditar], ['/ordenes', AdminOrdenes],
    ['/notificaciones', AdminNotificaciones], ['/incidencias', AdminIncidencias],
    ['/categorias', AdminCategorias], ['/usuarios', AdminUsuarios], ['/usuarios/:id', AdminUsuarioDetalle],
    ['/usuarios/:id/editar', AdminUsuarioEditar], ['/reportes', AdminReportes], ['/usuarios/nuevo', AdminUsuarioNuevo]
];

function App() {
    const { demostracion, escriturasHabilitadas } = useSesionConectada();
    const clienteAdmin = useMemo(() => demostracion
        ? crearAdminCatalogoApi({ habilitada: escriturasHabilitadas }, { soloTemporales: false })
        : undefined, [demostracion, escriturasHabilitadas]);

    return (
        <BrowserRouter>

            <div>

                <Navbar />

                <Routes>

                    {!demostracion && <>
                        <Route path="/" element={<Index />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/nosotros" element={<Nosotros />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/productos" element={<Productos />} />
                        <Route path="/contacto" element={<Contacto />} />
                        <Route path="/productos/:id" element={<DetalleProducto />} />
                    </>}

                    <Route element={<RutaConectada roles={ROLES_TIENDA} publica />}>
                        <Route path={RUTA_LOGIN_CONECTADO} element={<Login conectado />} />
                        <Route path={RUTA_REGISTRO_CONECTADO} element={<Register conectado />} />
                    </Route>
                    <Route path={RUTA_PERFIL_CONECTADO}
                        element={<RutaConectada roles={ROLES_TIENDA}><Perfil conectado /></RutaConectada>} />
                    <Route element={<RutaConectada />}>
                        <Route path={RUTA_ORDENES_CONECTADAS} element={<OrdenesConectadas />} />
                        <Route path={`${RUTA_ORDENES_CONECTADAS}/:id`} element={<OrdenesConectadas />} />
                        <Route path={`${RUTA_ORDENES_CONECTADAS}/:id/boleta`} element={<OrdenesConectadas comprobante />} />
                    </Route>

                    <Route path={RUTA_CATALOGO_CONECTADO} element={<CatalogoConectado />}>
                        <Route index element={<Productos />} />
                        <Route path="categorias" element={<RutaConectada roles={ROLES_TIENDA} publica><Categorias /></RutaConectada>} />
                        <Route path="ofertas" element={<RutaConectada roles={ROLES_TIENDA} publica><Ofertas /></RutaConectada>} />
                        <Route path=":id" element={<DetalleProducto />} />
                    </Route>

                    <Route element={<RevisionCarritoConectado />}>
                        <Route path={RUTA_CARRITO_CONECTADO}
                            element={<RutaConectada roles={ROLES_TIENDA} publica><Carrito conectado /></RutaConectada>} />
                        <Route path={RUTA_CHECKOUT_CONECTADO}
                            element={<RutaConectada roles={ROLES_TIENDA} porUsuario><Checkout conectado /></RutaConectada>} />
                        <Route path={RUTA_COMPRA_CONECTADA}
                            element={<RutaConectada roles={ROLES_TIENDA} porUsuario><CompraConectada /></RutaConectada>} />
                    </Route>

                    {!demostracion && <>
                        <Route path="/carrito" element={<Carrito />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/pago" element={<Pago />} />
                        <Route path="/compra-exitosa" element={<CompraExitosa />} />
                        <Route path="/pago-error" element={<PagoError />} />

                        <Route path="/ordenes" element={<Ordenes />} />
                        <Route path="/ordenes/:id" element={<DetalleOrden />} />
                        <Route path="/ordenes/:id/boleta" element={<Boleta />} />

                        <Route path="/incidencias" element={<Incidencias />} />
                        <Route path="/incidencias/nueva" element={<NuevaIncidencia />} />

                        {PAGINAS_ADMIN.map(([ruta, Pagina]) => (
                            <Route key={ruta} path={`/admin${ruta}`} element={<RutaAdmin><Pagina /></RutaAdmin>} />
                        ))}
                    </>}
                    <Route element={<RutaConectada roles={['ADMIN']} porUsuario />}>
                        {PAGINAS_ADMIN.filter(([, Pagina]) => !demostracion || PAGINAS_CATALOGO_ADMIN.includes(Pagina))
                            .map(([ruta, Pagina]) => (
                            <Route key={ruta} path={`${RUTA_ADMIN_CONECTADA}${ruta}`}
                                element={PAGINAS_CATALOGO_ADMIN.includes(Pagina) ? <Pagina conectado cliente={clienteAdmin} /> : <>
                                <p className="alert alert-info m-3">
                                    Panel de demostración con datos locales.{' '}
                                    <Link to={RUTA_ORDENES_CONECTADAS}>Ver órdenes de Spring Boot</Link>
                                </p>
                                <Pagina />
                                </>} />
                        ))}
                    </Route>
                    {!demostracion && <>
                        <Route path="/perfil" element={<Perfil />} />
                        <Route path="/categorias" element={<Categorias />} />
                        <Route path="/ofertas" element={<Ofertas />} />
                        <Route path="/blog/:id" element={<BlogDetalle />} />
                    </>}
                    {demostracion && <Route path="*" element={<Navigate to={RUTA_CATALOGO_CONECTADO} replace />} />}


                </Routes>

                <Footer />

            </div>

        </BrowserRouter>
    );
}

export default App;
