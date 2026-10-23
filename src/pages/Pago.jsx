import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import {
    obtenerProductos,
    guardarProductos
} from '../data/productos';
import { guardarOrden } from '../data/ordenes';

export default function Pago() {

    const {
        carrito,
        total,
        vaciarCarrito
    } = useCarrito();

    const [metodoPago, setMetodoPago] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    const datosCliente =
        location.state?.datosCliente || {};

    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });

    const descontarStock = () => {

        const productos = obtenerProductos();

        const productosActualizados = productos.map((producto) => {

            const productoCarrito = carrito.find(
                (item) => item.id === producto.id
            );

            if (!productoCarrito) {
                return producto;
            }

            return {
                ...producto,
                stock: Math.max(
                    0,
                    producto.stock - productoCarrito.cantidad
                )
            };
        });

        guardarProductos(productosActualizados);
    };

    const crearOrden = () => {

        const productosOrden = carrito.map((item) => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad
        }));

        guardarOrden({
            cliente: datosCliente,
            productos: productosOrden,
            total,
            metodoPago
        });
    };

    const procesarPago = () => {

        if (!metodoPago) {
            return;
        }

        // Simulación de pago rechazado
        if (metodoPago === 'credito') {
            navigate('/pago-error');
            return;
        }

        // Compra exitosa
        crearOrden();
        descontarStock();
        vaciarCarrito();

        navigate('/compra-exitosa');
    };

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
                                    checked={metodoPago === 'credito'}
                                    onChange={(event) =>
                                        setMetodoPago(event.target.value)
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
                                    checked={metodoPago === 'debito'}
                                    onChange={(event) =>
                                        setMetodoPago(event.target.value)
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
                                    checked={metodoPago === 'transferencia'}
                                    onChange={(event) =>
                                        setMetodoPago(event.target.value)
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

                            <p>
                                Total a pagar:
                            </p>

                            <h3 className="text-danger">
                                {formatoPrecio.format(total)}
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