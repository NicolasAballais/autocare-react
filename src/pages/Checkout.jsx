import { useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';

import { useCarrito } from '../context/CarritoContext';
import { useCarritoConectado } from '../context/CarritoConectadoContext.jsx';
import { RUTA_CARRITO_CONECTADO, RUTA_CATALOGO_CONECTADO, RUTA_COMPRA_CONECTADA } from '../context/catalogo.js';
import { obtenerSesion } from '../services/usuariosService';
import { useSesionConectada } from '../context/sesionConectada.js';


export default function Checkout({ conectado = false }) {
    const [errorEntrega, setErrorEntrega] = useState('');

    const local = useCarrito();
    const remoto = useCarritoConectado();
    const revision = useOutletContext();
    const carrito = conectado ? revision.lineas : local.carrito;
    const cantidadTotal = conectado ? remoto.cantidadTotal : local.cantidadTotal;
    const total = conectado ? revision.total : local.total;
    const { state } = useLocation();

    const navigate = useNavigate();

    const sesionRemota = useSesionConectada();
    const sesion = conectado ? sesionRemota.usuario : obtenerSesion();
    const entregaPrevia = conectado && state?.compradorId === sesion?.id ? state : null;


    const [datosCliente, setDatosCliente] = useState(entregaPrevia?.datosCliente ?? {

        nombre: sesion
            ? `${sesion.nombre || ''} ${sesion.apellido || ''}`.trim()
            : '',

        correo:
            sesion?.correo || '',

        telefono:
            sesion?.telefono || '',

        direccion:
            sesion?.direccion || '',

        comuna:
            sesion?.comuna || ''

    });


    const [tipoEntrega, setTipoEntrega] =
        useState(entregaPrevia?.tipoEntrega ?? '');


    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });


    function manejarCambio(evento) {

        const { name, value } =
            evento.target;

        setDatosCliente({
            ...datosCliente,
            [name]: value
        });
    }


    function continuarPago(evento) {

        evento.preventDefault();


        if (carrito.length === 0 || (conectado && !revision.puedeContinuar)) {
            return;
        }


        const campos = ['nombre', 'correo', 'telefono', 'comuna', 'direccion'];
        if (campos.some((campo) => !datosCliente[campo]?.trim()) || !tipoEntrega.trim()) {
            setErrorEntrega('Completa todos los datos de entrega con un valor válido.');
            return;
        }
        const entrega = Object.fromEntries(campos.map((campo) => [campo, datosCliente[campo].trim()]));
        navigate(conectado ? RUTA_COMPRA_CONECTADA : '/pago', {
            state: conectado ? { datosCliente: entrega, tipoEntrega, compradorId: sesion.id } : { datosCliente: entrega, tipoEntrega }
        });
    }


    /*
        PROTECCIÓN:
        evita entrar manualmente a /checkout
        cuando no existen productos.
    */
    if (carrito.length === 0) {

        return (
            <main className="container my-5">

                <div className="alert alert-warning">

                    <h4 className="alert-heading">
                        Tu carrito está vacío
                    </h4>

                    <p>
                        Debes agregar al menos un producto antes de continuar al checkout.
                    </p>

                    <hr />

                    <Link
                        to={conectado ? RUTA_CATALOGO_CONECTADO : '/productos'}
                        className="btn btn-danger"
                    >
                        Ver productos
                    </Link>
                    {conectado && <Link to={RUTA_CARRITO_CONECTADO} className="btn btn-outline-secondary ms-2">
                        Revisar carrito
                    </Link>}

                </div>

            </main>
        );
    }


    return (
        <main className="container my-5">

            <h1 className="mb-4">
                {conectado ? 'Checkout conectado' : 'Checkout'}
            </h1>

            {conectado && <p>Spring Boot guardará los datos de entrega junto con tu orden.</p>}


            {errorEntrega && <p className="alert alert-danger" role="alert">{errorEntrega}</p>}
            <form onSubmit={continuarPago}>

                <div className="row g-4">

                    <section className="col-lg-8">

                        <div className="card shadow-sm">

                            <div className="card-body">

                                <h4 className="mb-4">
                                    Datos de entrega
                                </h4>


                                {sesion && (

                                    <div className="alert alert-info">

                                        <i className="bi bi-person-check me-2"></i>

                                        Los datos fueron cargados automáticamente desde tu perfil.

                                    </div>

                                )}


                                <div className="row g-3">

                                    <div className="col-md-6">

                                        <label
                                            htmlFor="nombre"
                                            className="form-label"
                                        >
                                            Nombre completo
                                        </label>

                                        <input
                                            id="nombre"
                                            name="nombre"
                                            type="text"
                                            className="form-control"
                                            value={datosCliente.nombre}
                                            maxLength={conectado ? 150 : undefined}
                                            onChange={manejarCambio}
                                            required
                                        />

                                    </div>


                                    <div className="col-md-6">

                                        <label
                                            htmlFor="correo"
                                            className="form-label"
                                        >
                                            Correo electrónico
                                        </label>

                                        <input
                                            id="correo"
                                            name="correo"
                                            type="email"
                                            className="form-control"
                                            value={datosCliente.correo}
                                            maxLength={conectado ? 254 : undefined}
                                            onChange={manejarCambio}
                                            required
                                        />

                                    </div>


                                    <div className="col-md-6">

                                        <label
                                            htmlFor="telefono"
                                            className="form-label"
                                        >
                                            Teléfono
                                        </label>

                                        <input
                                            id="telefono"
                                            name="telefono"
                                            type="text"
                                            className="form-control"
                                            value={datosCliente.telefono}
                                            maxLength={conectado ? 30 : undefined}
                                            onChange={manejarCambio}
                                            required
                                        />

                                    </div>


                                    <div className="col-md-6">

                                        <label
                                            htmlFor="comuna"
                                            className="form-label"
                                        >
                                            Comuna
                                        </label>

                                        <input
                                            id="comuna"
                                            name="comuna"
                                            type="text"
                                            className="form-control"
                                            value={datosCliente.comuna}
                                            maxLength={conectado ? 100 : undefined}
                                            onChange={manejarCambio}
                                            required
                                        />

                                    </div>


                                    <div className="col-12">

                                        <label
                                            htmlFor="direccion"
                                            className="form-label"
                                        >
                                            Dirección de entrega
                                        </label>

                                        <input
                                            id="direccion"
                                            name="direccion"
                                            type="text"
                                            className="form-control"
                                            value={datosCliente.direccion}
                                            maxLength={conectado ? 300 : undefined}
                                            onChange={manejarCambio}
                                            required
                                        />

                                    </div>


                                    <div className="col-12">

                                        <hr className="my-3" />

                                        <h5>
                                            Opción de entrega
                                        </h5>

                                        <p className="text-muted">
                                            Selecciona cómo deseas recibir tu compra.
                                        </p>

                                    </div>


                                    <div className="col-12">

                                        <label
                                            htmlFor="tipoEntrega"
                                            className="form-label"
                                        >
                                            Método de entrega
                                        </label>

                                        <select
                                            id="tipoEntrega"
                                            className="form-select"
                                            value={tipoEntrega}
                                            onChange={(evento) =>
                                                setTipoEntrega(
                                                    evento.target.value
                                                )
                                            }
                                            required
                                        >

                                            <option value="">
                                                Selecciona una opción
                                            </option>

                                            <option value="Envío estándar">
                                                Envío estándar - 2 a 5 días hábiles
                                            </option>

                                            <option value="Envío express">
                                                Envío express - 24 a 48 horas
                                            </option>

                                        </select>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>


                    <aside className="col-lg-4">

                        <div className="card shadow-sm">

                            <div className="card-body">

                                <h4>
                                    Resumen de compra
                                </h4>

                                <hr />


                                <p>
                                    Productos diferentes: {carrito.length}
                                </p>

                                <p>
                                    Cantidad total: {cantidadTotal}
                                </p>


                                {tipoEntrega && (

                                    <p>
                                        Entrega:{' '}
                                        <strong>
                                            {tipoEntrega}
                                        </strong>
                                    </p>

                                )}


                                <hr />


                                <h4 className="text-danger">
                                    {conectado ? 'Total estimado: ' : 'Total: '}{formatoPrecio.format(total)}
                                </h4>


                                <button
                                    type="submit"
                                    className="btn btn-danger w-100 mt-3"
                                    disabled={conectado && !revision.puedeContinuar}
                                >
                                    {conectado ? 'Revisar compra' : 'Continuar al pago'}
                                </button>

                            </div>

                        </div>

                    </aside>

                </div>

            </form>

        </main>
    );
}
