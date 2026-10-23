export default function PagoError() {
    return (
        <main className="container my-5 text-center">

            <i className="bi bi-x-circle-fill text-danger fs-1"></i>

            <h1 className="mt-3">
                No fue posible procesar el pago
            </h1>

            <p className="text-muted">
                Intenta nuevamente o selecciona otro método de pago.
            </p>

        </main>
    );
}