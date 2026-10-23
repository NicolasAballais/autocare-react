import { Navigate } from 'react-router-dom';
import { obtenerSesion } from '../data/usuarios';

export default function RutaAdmin({ children }) {

    const sesion = obtenerSesion();

    if (!sesion) {
        return <Navigate to="/login" replace />;
    }

    if (sesion.rol !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}