import {BrowserRouter, Routes, Route} from 'react-router-dom';

import './App.css'
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Index from './pages/Index'
import Blog from './pages/Blog'
import Login from './pages/Login'
import Nosotros from './pages/Nosotros'
import Register from './pages/Register'
import Productos from './pages/Productos'
import Contacto from './pages/Contacto'
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


function App() {
return(
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
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/ordenes/:id" element={<DetalleOrden />} />
          <Route path="/ordenes/:id/boleta" element={<Boleta />} />
          <Route path="/admin/productos" element={<AdminProductos />} />
          <Route path="/admin/productos/nuevo" element={<AdminProductoNuevo />} />
          <Route path="/admin/productos/editar/:id" element={<AdminProductoEditar />} />
          <Route path="/admin/ordenes" element={<AdminOrdenes />} />
<Route
    path="/pago-error"
    element={<PagoError />}
/>
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App