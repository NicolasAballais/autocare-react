import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';

import Footer from './components/Footer';
import Navbar from './components/Navbar';
import RutaAdmin from './components/RutaAdmin';

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

function App() {

    return (
        <BrowserRouter>

            <div>

                <Navbar />

                <Routes>

                    <Route path="/" element={<Index />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/nosotros" element={<Nosotros />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/productos" element={<Productos />} />
                    <Route path="/contacto" element={<Contacto />} />
                    <Route path="/productos/:id" element={<DetalleProducto />} />

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

                    <Route path="/admin" element={<RutaAdmin><AdminPanel /></RutaAdmin>} />
                    <Route path="/admin/productos" element={<RutaAdmin><AdminProductos /></RutaAdmin>} />
                    <Route path="/admin/productos/nuevo" element={<RutaAdmin><AdminProductoNuevo /></RutaAdmin>} />
                    <Route path="/admin/productos/editar/:id" element={<RutaAdmin><AdminProductoEditar /></RutaAdmin>} />
                    <Route path="/admin/ordenes" element={<RutaAdmin><AdminOrdenes /></RutaAdmin>} />
                    <Route path="/admin/notificaciones" element={<RutaAdmin><AdminNotificaciones /></RutaAdmin>} />
                    <Route path="/admin/incidencias" element={<RutaAdmin><AdminIncidencias /></RutaAdmin>} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/categorias" element={<Categorias />} />
                    <Route path="/admin/categorias" element={<RutaAdmin><AdminCategorias /></RutaAdmin>} />
                    <Route path="/admin/usuarios" element={<RutaAdmin><AdminUsuarios /></RutaAdmin>} />
                    <Route path="/admin/usuarios/:id" element={<RutaAdmin><AdminUsuarioDetalle /></RutaAdmin>} />
                    <Route path="/admin/usuarios/:id/editar" element={<RutaAdmin><AdminUsuarioEditar /></RutaAdmin>} />
                    <Route path="/ofertas" element={<Ofertas />} />
                    <Route path="/admin/reportes" element={<RutaAdmin><AdminReportes /></RutaAdmin>} />
                    <Route path="/admin/usuarios/nuevo" element={<RutaAdmin><AdminUsuarioNuevo /></RutaAdmin>} />
                    <Route path="/blog/:id" element={<BlogDetalle />} />


                </Routes>

                <Footer />

            </div>

        </BrowserRouter>
    );
}

export default App;