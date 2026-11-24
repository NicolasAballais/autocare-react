import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBaseAdmin } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import { useConsultaCatalogoAdmin } from '../hooks/useConsultaCatalogoAdmin.js';
import { adminCatalogoApi, cargarProductoAdmin, listarCategoriasAdmin, mensajeErrorAdmin } from '../services/adminCatalogoApi.js';
import { esRegistroTemporal } from '../services/adminCatalogoConfiguracion.js';
import { obtenerCategorias } from '../services/categoriasService.js';
import { actualizarProducto, crearProducto, obtenerProductos } from '../services/productosService.js';
import { AvisoEscriturasAdmin, ErroresFormularioAdmin, EstadoCatalogoAdmin } from './EstadoCatalogoAdmin.jsx';

const ENTERO_MAXIMO = 2147483647;
const campos = [
    ['codigo', 'Código', { minLength: 3, maxLength: 64, required: true }],
    ['nombre', 'Nombre', { maxLength: 100, required: true }],
    ['descripcion', 'Descripción', { maxLength: 500 }],
    ['precio', 'Precio', { min: 0, max: Number.MAX_SAFE_INTEGER, step: 'any', required: true }],
    ['descuento', 'Descuento (%)', { min: 0, max: 100, step: 'any' }],
    ['stock', 'Stock', { min: 0, max: ENTERO_MAXIMO, step: 1, required: true }],
    ['stockCritico', 'Stock crítico', { min: 0, max: ENTERO_MAXIMO, step: 1 }],
    ['imagen', 'Ruta de la imagen', { maxLength: 2048, placeholder: '/images/producto.png' }]
];
const etiquetas = { ...Object.fromEntries(campos.map(([campo, etiqueta]) => [campo, etiqueta])),
    categoria: 'Categoría', categoriaId: 'Categoría' };

function camposVisibles(conectado) {
    if (conectado) return campos;
    return campos.filter(([campo]) => campo !== 'descuento').map(([campo, etiqueta, reglas]) => {
        if (campo === 'nombre' || campo === 'descripcion') return [campo, etiqueta, reglas];
        return [campo, etiqueta, { ...reglas, maxLength: undefined, max: undefined }];
    });
}

function validar(formulario, conectado, categorias) {
    const errores = {};
    for (const [campo, , reglas] of camposVisibles(conectado)) {
        const valor = String(formulario[campo]).trim();
        if (reglas.required && !valor) {
            errores[campo] = 'Este campo es obligatorio.';
        } else if (reglas.min === 0) {
            const numero = Number(valor);
            if (!Number.isFinite(numero) || numero < 0 || numero > (reglas.max ?? Infinity) ||
                (reglas.step === 1 && !Number.isInteger(numero))) {
                errores[campo] = campo === 'descuento' ? 'Ingresa un descuento entre 0 y 100.' :
                    reglas.step === 1 ? 'Ingresa un número entero válido, mayor o igual a cero.' : 'Ingresa un precio válido, mayor o igual a cero.';
            }
        } else if (valor.length < (reglas.minLength ?? 0) || valor.length > (reglas.maxLength ?? Infinity)) {
            errores[campo] = valor.length < (reglas.minLength ?? 0) ?
                `Ingresa al menos ${reglas.minLength} caracteres.` : `El máximo permitido es de ${reglas.maxLength} caracteres.`;
        }
    }
    const campoCategoria = conectado ? 'categoriaId' : 'categoria';
    if (!categorias.some((item) => (conectado ? item.id : item.nombre) === formulario[campoCategoria])) {
        errores[campoCategoria] = 'Selecciona una categoría disponible.';
    }
    return errores;
}

export default function FormularioAdminProducto({ conectado = false, id, cliente = adminCatalogoApi }) {
    const baseAdmin = useBaseAdmin();
    const categoriasApi = useConsultaCatalogoAdmin(conectado, listarCategoriasAdmin);
    const detalleApi = useConsultaCatalogoAdmin(conectado && Boolean(id), cargarProductoAdmin, id);
    const categorias = conectado ? categoriasApi.datos : obtenerCategorias();
    const producto = conectado ? detalleApi.datos : id ? obtenerProductos().find((item) => item.id === Number(id)) : undefined;

    return <main className="container my-5">
        <h1 className="mb-1">{id ? 'Editar producto' : 'Nuevo producto'}</h1>
        <Link className="btn btn-outline-secondary my-3" to={`${baseAdmin}/productos`}>Volver a productos</Link>
        {conectado && <AvisoEscriturasAdmin habilitada={cliente.habilitada} soloTemporales={cliente.soloTemporales} />}
        <EstadoCatalogoAdmin consulta={categoriasApi} />
        <EstadoCatalogoAdmin consulta={detalleApi} />
        {!conectado && id && !producto && <p role="alert" className="alert alert-danger">Producto no encontrado.</p>}
        {categorias && (!id || producto) &&
            <CamposProducto key={id ?? 'nuevo'} {...{ producto, categorias, conectado, cliente, baseAdmin }} />}
    </main>;
}

function CamposProducto({ producto, categorias, conectado, cliente, baseAdmin }) {
    const { usuario, solicitar } = useSesionConectada();
    const navigate = useNavigate();
    const enviando = useRef(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);
    const [formulario, setFormulario] = useState(() => ({
        codigo: '', nombre: '', descripcion: '', imagen: '', precio: '', descuento: 0, stock: '', stockCritico: '',
        categoria: '', categoriaId: '', ...producto
    }));
    const puedeGuardar = !conectado || (usuario?.rol === 'ADMIN' && cliente.habilitada &&
        (!producto || cliente.puedeEditar('productos', producto)));
    const opciones = conectado && puedeGuardar && cliente.soloTemporales
        ? categorias.filter((item) => esRegistroTemporal('categorias', item)) : categorias;
    const campoCategoria = conectado ? 'categoriaId' : 'categoria';

    function cambiar(evento) {
        const { name, value } = evento.target;
        setFormulario((anterior) => ({ ...anterior, [name]: value }));
    }

    async function guardar(evento) {
        evento.preventDefault();
        if (enviando.current || !puedeGuardar) return;
        const invalidos = validar(formulario, conectado, opciones);
        if (Object.keys(invalidos).length) {
            setError({ mensaje: 'Revisa los campos indicados.', campos: invalidos });
            return;
        }
        const { codigo, nombre, descripcion, precio, descuento, stock, stockCritico, imagen, categoriaId, categoria } = formulario;
        const datos = { codigo: codigo.trim(), nombre: nombre.trim(), descripcion: descripcion.trim(),
            precio: Number(precio), stock: Number(stock), stockCritico: Number(stockCritico),
            imagen: imagen.trim() || '/images/Tienda.png' };

        if (!conectado) {
            const duplicado = obtenerProductos().some((item) => item.id !== producto?.id &&
                item.codigo.toLowerCase() === datos.codigo.toLowerCase());
            if (duplicado) {
                setError({ mensaje: 'Ya existe un producto con ese código.' });
                return;
            }
            if (producto) actualizarProducto(producto.id, { ...datos, categoria });
            else crearProducto({ ...datos, categoria });
            navigate(`${baseAdmin}/productos`);
            return;
        }

        enviando.current = true;
        setGuardando(true);
        setError(null);
        try {
            await solicitar((token) => cliente.guardarProducto(producto?.id, {
                ...datos, descuento: Number(descuento), categoriaId
            }, token, producto), usuario.id);
            navigate(`${baseAdmin}/productos`, { state: { confirmacion: producto ? 'Producto actualizado.' : 'Producto creado.' } });
        } catch (causa) {
            setError({ mensaje: mensajeErrorAdmin(causa), campos: causa.estado === 400 ? causa.campos : undefined });
        } finally {
            enviando.current = false;
            setGuardando(false);
        }
    }

    return <div className="card shadow-sm"><div className="card-body">
        {conectado && cliente.soloTemporales && cliente.habilitada && producto && !puedeGuardar &&
            <p>Este producto está disponible para consulta. La edición requiere un ID temporal autorizado.</p>}
        {conectado && puedeGuardar && !opciones.length &&
            <p>{cliente.soloTemporales ? 'Crea una categoría TEST- antes de guardar este producto.' : 'Crea una categoría antes de guardar este producto.'}</p>}
        <ErroresFormularioAdmin error={error} etiquetas={etiquetas} />
        <form onSubmit={guardar} noValidate>
            <fieldset disabled={!puedeGuardar || guardando}>
                <div className="row g-3">
                    {camposVisibles(conectado).map(([campo, etiqueta, reglas]) => <div className={campo === 'descripcion' ? 'col-12' : 'col-md-6'} key={campo}>
                        <label className="form-label" htmlFor={campo}>{etiqueta}</label>
                        {campo === 'descripcion' ?
                            <textarea className="form-control" id={campo} name={campo} rows={3} {...reglas}
                                value={formulario[campo]} onChange={cambiar} /> :
                            <input className="form-control" id={campo} name={campo} type={reglas.min === 0 ? 'number' : 'text'}
                                {...reglas} value={formulario[campo]} onChange={cambiar} />}
                    </div>)}
                    <div className="col-md-6">
                        <label className="form-label" htmlFor={campoCategoria}>Categoría</label>
                        <select className="form-select" id={campoCategoria} name={campoCategoria} required
                            value={formulario[campoCategoria]} onChange={cambiar}>
                            <option value="">Seleccionar categoría</option>
                            {opciones.map((item) => <option key={item.id} value={conectado ? item.id : item.nombre}>{item.nombre}</option>)}
                        </select>
                    </div>
                </div>
                <button type="submit" className="btn btn-danger mt-3" disabled={conectado && !opciones.length}>
                    {guardando ? 'Guardando…' : producto ? 'Guardar cambios' : 'Guardar producto'}
                </button>
            </fieldset>
        </form>
    </div></div>;
}
