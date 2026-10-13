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
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App