import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { obtenerCategoriasApi, obtenerProductosApi } from '../services/catalogoApi';

export default function CatalogoConectado() {
    const [catalogo, setCatalogo] = useState(null);
    const [error, setError] = useState('');
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        let vigente = true;

        async function cargarCatalogo() {
            try {
                const [productos, categorias] = await Promise.all([
                    obtenerProductosApi(),
                    obtenerCategoriasApi()
                ]);

                if (!Array.isArray(productos) || !Array.isArray(categorias)) {
                    throw new Error('La API devolvió un catálogo con un formato inesperado.');
                }

                if (vigente) setCatalogo({ productos, categorias });
            } catch (causa) {
                if (vigente) setError(causa.message);
            }
        }

        cargarCatalogo();
        return () => { vigente = false; };
    }, [intento]);

    function reintentar() {
        setError('');
        setIntento((numero) => numero + 1);
    }

    return (
        <>
            <div className="container mt-4">
                <div className="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div>
                        <strong>Catálogo conectado · solo lectura</strong>
                        <div>El carrito y la compra están disponibles en el catálogo local.</div>
                    </div>
                    <Link className="btn btn-outline-secondary btn-sm" to="/productos">
                        Volver al catálogo local
                    </Link>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        <p>No se pudo cargar el catálogo conectado. {error}</p>
                        <button className="btn btn-outline-danger btn-sm" onClick={reintentar}>
                            Reintentar
                        </button>
                    </div>
                )}

                {!catalogo && !error && <p role="status">Cargando catálogo conectado…</p>}
            </div>

            {catalogo && <Outlet context={catalogo} />}
        </>
    );
}
