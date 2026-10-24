import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { obtenerSesion } from '../data/usuarios';

export default function Checkout() {

    const {
        carrito,
        cantidadTotal,
        total
    } = useCarrito();

    const navigate = useNavigate();

    const sesion = obtenerSesion();

    const [datosCliente, setDatosCliente] = useState({
        nombre: sesion
            ? `${sesion.nombre || ''} ${sesion.apellido || ''}`.trim()
            : '',
        correo: sesion?.correo || '',
        telefono: sesion?.telefono || '',
        direccion: sesion?.direccion || '',
        comuna: sesion?.comuna || ''
    });

    const [tipoEntrega, setTipoEntrega] = useState('');

    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });

    const manejarCambio = (event) => {

        const { name, value } = event.target;

        setDatosCliente({
            ...datosCliente,
            [name]: value
        });
    };

    const continuarPago = (event) => {

        event.preventDefault();

        navigate('/pago', {
            state: {
                datosCliente,
                tipoEntrega
            }
        });
    };

    return (
        <main className="container my-5">

            <h1 className="mb-4">
                Checkout
            </h1>

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
                                            onChange={(event) =>
                                                setTipoEntrega(event.target.value)
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
                                        Entrega: <strong>{tipoEntrega}</strong>
                                    </p>

                                )}

                                <hr />

                                <h4 className="text-danger">
                                    Total: {formatoPrecio.format(total)}
                                </h4>

                                <button
                                    type="submit"
                                    className="btn btn-danger w-100 mt-3"
                                >
                                    Continuar al pago
                                </button>

                            </div>

                        </div>

                    </aside>

                </div>

            </form>

        </main>
    );
}