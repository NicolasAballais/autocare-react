import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';

export default function Pago() {

    const { total } = useCarrito();

    const [metodoPago, setMetodoPago] = useState('');

    const navigate = useNavigate();

    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });

    const procesarPago = () => {

        if (!metodoPago) {
            return;
        }

        // Simulación para probar ambos resultados del flujo.
        if (metodoPago === 'credito') {
            navigate('/pago-error');
        } else {
            navigate('/compra-exitosa');
        }
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