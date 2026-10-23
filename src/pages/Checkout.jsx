import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';

export default function Checkout() {

    const {
        carrito,
        cantidadTotal,
        total
    } = useCarrito();

    const navigate = useNavigate();

    const [datosCliente, setDatosCliente] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        direccion: '',
        comuna: ''
    });

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
                datosCliente
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