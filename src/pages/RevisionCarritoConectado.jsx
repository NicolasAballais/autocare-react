import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useCarritoConectado } from '../context/CarritoConectadoContext.jsx';
import { RUTA_CATALOGO_CONECTADO, RUTA_COMPRA_CONECTADA } from '../context/catalogo.js';
import { obtenerProductosApi } from '../services/catalogoApi.js';
import { revisarCarritoConectado } from '../services/carritoService.js';

export default function RevisionCarritoConectado() {
    const { carrito, intento } = useCarritoConectado();
    const { pathname } = useLocation();
    const [revision, setRevision] = useState(null);
    const [intentos, setIntentos] = useState(0);

    useEffect(() => {
        let vigente = true;
        async function consultarCatalogo() {
            try {
                const productos = await obtenerProductosApi();
                if (!Array.isArray(productos)) throw new Error('La API no devolvió un listado de productos.');
                if (vigente) setRevision({ pathname, intentos, productos });
            } catch (error) {
                if (vigente) setRevision({ pathname, intentos, error: error.message });
            }
        }
        consultarCatalogo();
        return () => { vigente = false; };
    }, [pathname, intentos]);

    const actual = revision?.pathname === pathname && revision.intentos === intentos ? revision : null;
    const lineas = actual?.productos ? revisarCarritoConectado(carrito, actual.productos) : carrito;
    const insuficientes = actual?.productos ? lineas.filter((linea) => linea.cantidad > linea.stock) : [];
    const preciosActualizados = lineas.some((linea) => linea.precioAnterior != null && linea.precioAnterior !== linea.precio);
    const puedeContinuar = Boolean(actual?.productos && lineas.length && !insuficientes.length && !intento);
    const total = lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0);

    return (
        <>
            <div className="container mt-4">
                <Link to={RUTA_CATALOGO_CONECTADO}>Volver al catálogo conectado</Link>
                {!actual && <p role="status">Consultando precios y stock…</p>}
                {actual?.error && (
                    <div className="alert alert-danger mt-2" role="alert">
                        No se pudieron verificar los precios y el stock. {actual.error}
                        <button type="button" className="btn btn-outline-danger btn-sm ms-2"
                            onClick={() => setIntentos((valor) => valor + 1)}>Actualizar catálogo</button>
                    </div>
                )}
                {insuficientes.map((linea) => (
                    <p key={linea.id} className="alert alert-warning mt-2" role="alert">
                        {linea.nombre} · {linea.noDisponible ? 'El producto ya no existe.' : `Stock disponible: ${linea.stock}.`}
                    </p>
                ))}
                {preciosActualizados && <p className="alert alert-info mt-2">Hay precios actualizados por el servidor.</p>}
                {intento && pathname !== RUTA_COMPRA_CONECTADA && (
                    <p className="alert alert-warning mt-2">
                        Hay una compra por verificar. <Link to={RUTA_COMPRA_CONECTADA}>Ver estado de la compra</Link>
                    </p>
                )}
            </div>
            <Outlet context={{ lineas, total, puedeContinuar, productos: actual?.productos }} />
        </>
    );
}
