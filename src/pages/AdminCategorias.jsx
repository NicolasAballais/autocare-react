import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBaseAdmin } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import { useConsultaCatalogoAdmin } from '../hooks/useConsultaCatalogoAdmin.js';
import { adminCatalogoApi, listarCategoriasAdmin, listarProductosAdmin, mensajeErrorAdmin } from '../services/adminCatalogoApi.js';
import { actualizarCategoria, eliminarCategoria, guardarCategoria, obtenerCategorias } from '../services/categoriasService.js';
import { AvisoEscriturasAdmin, ErroresFormularioAdmin, EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';

export default function AdminCategorias({ conectado = false, cliente = adminCatalogoApi }) {
    const baseAdmin = useBaseAdmin();
    const { usuario, solicitar } = useSesionConectada();
    const consulta = useConsultaCatalogoAdmin(conectado, listarCategoriasAdmin);
    const productosApi = useConsultaCatalogoAdmin(conectado, listarProductosAdmin);
    const [local, setLocal] = useState(() => conectado ? [] : obtenerCategorias());
    const [nombre, setNombre] = useState('');
    const [editando, setEditando] = useState(null);
    const [aviso, setAviso] = useState('');
    const [error, setError] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const ocupado = useRef(false);
    const categorias = conectado ? consulta.datos : local;
    const puedeCrear = !conectado || (usuario?.rol === 'ADMIN' && cliente.habilitada);
    const puedeEditar = (categoria) => puedeCrear && (!conectado || cliente.puedeEditar('categorias', categoria));

    function editar(categoria) {
        setEditando(categoria);
        setNombre(categoria?.nombre ?? '');
        setError(null);
        setAviso('');
    }

    async function cambiarCategoria(operacionLocal, operacionApi, mensaje) {
        if (ocupado.current) return;
        setError(null);
        setAviso('');
        if (!conectado) {
            const resultado = operacionLocal();
            if (!resultado.exito) {
                setError({ mensaje: resultado.mensaje });
                return;
            }
            setLocal(obtenerCategorias());
        } else {
            ocupado.current = true;
            setProcesando(true);
            try {
                await solicitar(operacionApi, usuario.id);
                consulta.recargar();
            } catch (causa) {
                setError({ mensaje: mensajeErrorAdmin(causa), campos: causa.estado === 400 ? causa.campos : undefined });
                return;
            } finally {
                ocupado.current = false;
                setProcesando(false);
            }
        }
        editar(null);
        setAviso(mensaje);
    }

    function guardar(evento) {
        evento.preventDefault();
        if (!puedeCrear || (editando && !puedeEditar(editando))) return;
        const limpio = nombre.trim();
        if (!limpio || (conectado && limpio.length > 100)) {
            setError({ mensaje: conectado ? 'El nombre es obligatorio y admite hasta 100 caracteres.' : 'Ingresa el nombre de la categoría.' });
            return;
        }
        return cambiarCategoria(
            () => editando ? actualizarCategoria(editando.id, limpio) : guardarCategoria(limpio),
            (token) => cliente.guardarCategoria(editando?.id, { nombre: limpio }, token, editando),
            editando ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.'
        );
    }

    function borrar(categoria) {
        if (ocupado.current || !puedeEditar(categoria) || !window.confirm(`¿Deseas eliminar la categoría "${categoria.nombre}"?`)) return;
        return cambiarCategoria(
            () => eliminarCategoria(categoria.id),
            (token) => cliente.eliminarCategoria(categoria.id, token),
            'Categoría eliminada correctamente.'
        );
    }

    return <main className="container my-5">
        <Link to={baseAdmin} className="btn btn-outline-secondary mb-3">← Volver al panel</Link>
        <div className="mb-4">
            <h1 className="mb-1">Administración de Categorías</h1>
            <p className="text-muted">Crear, editar y eliminar categorías de productos.</p>
        </div>
        {conectado && <AvisoEscriturasAdmin habilitada={cliente.habilitada} />}
        <div className="row g-4">
            <div className="col-lg-4"><div className="card shadow-sm"><div className="card-body">
                <h2 className="h4 mb-3">{editando ? 'Editar categoría' : 'Nueva categoría'}</h2>
                {aviso && <p role="status" className="alert alert-success">{aviso}</p>}
                <ErroresFormularioAdmin error={error} etiquetas={{ nombre: 'Nombre' }} />
                <form onSubmit={guardar} noValidate>
                    <fieldset disabled={!puedeCrear || procesando}>
                        <div className="mb-3">
                            <label htmlFor="nombre-categoria" className="form-label">Nombre</label>
                            <input id="nombre-categoria" className="form-control" required value={nombre}
                                maxLength={conectado ? 100 : undefined} onChange={(evento) => setNombre(evento.target.value)} />
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-danger">{editando ? 'Guardar cambios' : 'Crear categoría'}</button>
                            {editando && <button type="button" className="btn btn-outline-secondary"
                                onClick={() => editar(null)}>Cancelar</button>}
                        </div>
                    </fieldset>
                </form>
            </div></div></div>

            <div className="col-lg-8"><div className="card shadow-sm"><div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                    <h2 className="h4 mb-0">Categorías registradas</h2>
                    <span className="badge text-bg-secondary">{categorias?.length ?? '—'}</span>
                </div>
                <EstadoCatalogoAdmin consulta={consulta} />
                {conectado && <EstadoCatalogoAdmin consulta={productosApi} />}
                {categorias?.length ? <div className="table-responsive"><table className="table align-middle">
                    <thead><tr><th>ID</th><th>Nombre</th>{conectado && <th>Productos asociados</th>}<th>Acciones</th></tr></thead>
                    <tbody>{categorias.map((categoria) => {
                        const asociados = productosApi.datos?.filter((producto) => producto.categoriaId === categoria.id);
                        return <tr key={categoria.id}>
                            <td>{categoria.id}</td><td>{categoria.nombre}</td>
                            {conectado && <td>{asociados?.length ? <details>
                                <summary>{asociados.length} {asociados.length === 1 ? 'producto' : 'productos'}</summary>
                                <ul className="mb-0">{asociados.map((producto) => <li key={producto.id}>{producto.nombre}</li>)}</ul>
                            </details> : asociados ? '0' : '—'}</td>}
                            <td><div className="d-flex gap-2">
                                <button type="button" disabled={!puedeEditar(categoria) || procesando} className="btn btn-outline-primary btn-sm"
                                    onClick={() => editar(categoria)}>Editar</button>
                                <button type="button" disabled={!puedeEditar(categoria) || procesando} className="btn btn-outline-danger btn-sm"
                                    onClick={() => borrar(categoria)}>Eliminar</button>
                            </div></td>
                        </tr>;
                    })}</tbody>
                </table></div> : categorias && <p>Todavía no hay categorías.</p>}
            </div></div></div>
        </div>
    </main>;
}
