import { useState } from 'react';
import { proponerCarritoConectado } from '../services/carritoService.js';

const formato = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
const describirAviso = {
    'precio-modificado': ({ precioAnterior, precioActual }) => `Precio ${formato.format(precioAnterior)} → ${formato.format(precioActual)}`,
    'stock-modificado': ({ stockAnterior, stockActual }) => `Stock ${stockAnterior} → ${stockActual}`,
    'stock-insuficiente': ({ cantidadSolicitada, cantidadDisponible }) => `Solicitadas ${cantidadSolicitada}, disponibles ${cantidadDisponible}`,
    'producto-inexistente': () => 'El producto no está en el catálogo conectado',
    'cantidad-invalida': () => 'Cantidad inválida'
};

export default function ImportarCarritoLocal({ carritoLocal, productos, aplicar, origen = 'carrito local' }) {
    const [propuesta, setPropuesta] = useState(null);

    if (!carritoLocal.length) return null;

    return (
        <section className="card p-3 mt-4" aria-label={`Importar ${origen}`}>
            <button type="button" className="btn btn-outline-secondary align-self-start" disabled={!productos}
                onClick={() => setPropuesta(proponerCarritoConectado(carritoLocal, productos))}>
                Revisar importación del {origen}
            </button>
            {propuesta && (
                <div className="mt-3">
                    <h2 className="h5">Propuesta de importación</h2>
                    <p>Se conserva el {origen}. Si un producto ya está en el carrito conectado, se toma la mayor cantidad.</p>
                    {propuesta.carritoPropuesto.length ? (
                        <ul>{propuesta.carritoPropuesto.map((linea) => (
                            <li key={linea.id}>{linea.nombre} × {linea.cantidad} · {formato.format(linea.precio)} por unidad</li>
                        ))}</ul>
                    ) : <p>No hay productos disponibles para importar.</p>}
                    {propuesta.avisos.length > 0 && <ul>{propuesta.avisos.map((aviso, indice) => (
                        <li key={`${aviso.tipo}-${aviso.id}-${indice}`}>
                            {aviso.codigo ?? aviso.id} · {describirAviso[aviso.tipo](aviso)}
                        </li>
                    ))}</ul>}
                    <button type="button" className="btn btn-danger me-2" disabled={!productos || !propuesta.carritoPropuesto.length}
                        onClick={() => { aplicar(propuesta); setPropuesta(null); }}>Confirmar importación</button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setPropuesta(null)}>Cancelar</button>
                </div>
            )}
        </section>
    );
}
