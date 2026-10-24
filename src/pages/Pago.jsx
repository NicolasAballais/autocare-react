import { useState } from 'react';
import {
    Link,
    useLocation,
    useNavigate
} from 'react-router-dom';

import { useCarrito } from '../context/CarritoContext';

import {
    obtenerProductos,
    guardarProductos
} from '../services/productosService';

import {
    guardarOrden
} from '../services/ordenesService';


export default function Pago() {

    const {
        carrito,
        total,
        vaciarCarrito
    } = useCarrito();

    const [metodoPago, setMetodoPago] =
        useState('');

    const navigate = useNavigate();
    const location = useLocation();


    const datosCliente =
        location.state?.datosCliente;

    const tipoEntrega =
        location.state?.tipoEntrega;


    const formatoPrecio = new Intl.NumberFormat(
        'es-CL',
        {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }
    );


    /*
        PROTECCIÓN:
        evita entrar manualmente a /pago
        sin productos.
    */
    if (carrito.length === 0) {

        return (
            <main className="container my-5">

                <div className="alert alert-warning">

                    <h4 className="alert-heading">
                        No hay productos para pagar
                    </h4>

                    <p>
                        Tu carrito está vacío. Agrega productos antes de continuar con el pago.
                    </p>

                    <hr />

                    <Link
                        to="/productos"
                        className="btn btn-danger"
                    >
                        Ver productos
                    </Link>

                </div>

            </main>
        );
    }


    /*
        PROTECCIÓN:
        si existen productos, pero el usuario
        entró directamente a /pago sin pasar
        por Checkout.
    */
    if (
        !datosCliente ||
        !tipoEntrega
    ) {

        return (
            <main className="container my-5">

                <div className="alert alert-warning">

                    <h4 className="alert-heading">
                        Faltan los datos de entrega
                    </h4>

                    <p>
                        Debes completar el Checkout antes de seleccionar un método de pago.
                    </p>

                    <hr />

                    <Link
                        to="/checkout"
                        className="btn btn-danger"
                    >
                        Ir al checkout
                    </Link>

                </div>

            </main>
        );
    }


    function obtenerProductosOrden() {

        return carrito.map(
            (item) => ({
                id: item.id,
                nombre: item.nombre,
                precio: item.precio,
                precioOriginal:
                    item.precioOriginal
                    ?? item.precio,
                descuento:
                    item.descuento ?? 0,
                cantidad: item.cantidad,
                subtotal:
                    item.precio *
                    item.cantidad
            })
        );
    }


    function descontarStock() {

        const productos =
            obtenerProductos();


        const productosActualizados =
            productos.map(
                (producto) => {

                    const productoCarrito =
                        carrito.find(
                            (item) =>
                                item.id ===
                                producto.id
                        );


                    if (!productoCarrito) {
                        return producto;
                    }


                    return {
                        ...producto,

                        stock: Math.max(
                            0,
                            producto.stock -
                            productoCarrito.cantidad
                        )
                    };

                }
            );


        guardarProductos(
            productosActualizados
        );
    }


    function crearOrden() {

        const productosOrden =
            obtenerProductosOrden();


        return guardarOrden({

            cliente:
                datosCliente,

            productos:
                productosOrden,

            total,

            metodoPago,

            tipoEntrega

        });
    }


    function procesarPago() {

        if (!metodoPago) {
            return;
        }


        const productosOrden =
            obtenerProductosOrden();


        /*
            SIMULACIÓN:
            tarjeta de crédito = pago rechazado.
        */
        if (
            metodoPago === 'credito'
        ) {

            navigate(
                '/pago-error',
                {
                    state: {
                        cliente:
                            datosCliente,

                        productos:
                            productosOrden,

                        total,

                        metodoPago,

                        tipoEntrega
                    }
                }
            );

            return;
        }


        /*
            Débito y transferencia:
            pago exitoso.
        */

        const nuevaOrden =
            crearOrden();


        descontarStock();

        vaciarCarrito();


        navigate(
            '/compra-exitosa',
            {
                state: {
                    orden:
                        nuevaOrden
                }
            }
        );
    }


    return (
        <main className="container my-5">

            <h1 className="mb-4">
                Pago
            </h1>


            <div className="row g-4">

                <section className="col-lg-8">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h4 className="mb-4">
                                Selecciona un método de pago
                            </h4>


                            <div className="form-check mb-3">

                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="metodoPago"
                                    id="credito"
                                    value="credito"
                                    checked={
                                        metodoPago ===
                                        'credito'
                                    }
                                    onChange={(evento) =>
                                        setMetodoPago(
                                            evento.target.value
                                        )
                                    }
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="credito"
                                >
                                    Tarjeta de crédito
                                </label>

                            </div>


                            <div className="form-check mb-3">

                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="metodoPago"
                                    id="debito"
                                    value="debito"
                                    checked={
                                        metodoPago ===
                                        'debito'
                                    }
                                    onChange={(evento) =>
                                        setMetodoPago(
                                            evento.target.value
                                        )
                                    }
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="debito"
                                >
                                    Tarjeta de débito
                                </label>

                            </div>


                            <div className="form-check">

                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="metodoPago"
                                    id="transferencia"
                                    value="transferencia"
                                    checked={
                                        metodoPago ===
                                        'transferencia'
                                    }
                                    onChange={(evento) =>
                                        setMetodoPago(
                                            evento.target.value
                                        )
                                    }
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="transferencia"
                                >
                                    Transferencia bancaria
                                </label>

                            </div>

                        </div>

                    </div>

                </section>


                <aside className="col-lg-4">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h4>
                                Resumen del pago
                            </h4>

                            <hr />


                            <p className="mb-1">
                                Entrega:
                            </p>

                            <p>
                                <strong>
                                    {tipoEntrega}
                                </strong>
                            </p>


                            <p className="mb-1">
                                Total a pagar:
                            </p>

                            <h3 className="text-danger">
                                {
                                    formatoPrecio.format(
                                        total
                                    )
                                }
                            </h3>


                            <button
                                type="button"
                                className="btn btn-danger w-100 mt-4"
                                disabled={!metodoPago}
                                onClick={procesarPago}
                            >
                                Pagar
                            </button>

                        </div>

                    </div>

                </aside>

            </div>

        </main>
    );
}