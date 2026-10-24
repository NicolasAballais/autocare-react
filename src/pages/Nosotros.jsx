export default function Nosotros() {

    return (
        <main className="container my-5">

            <section className="text-center p-5 rounded shadow-sm border">

                <h1 className="mb-4">
                    Sobre Nosotros
                </h1>

                <p className="lead">
                    En AutoCarePro nos apasiona el mundo automotriz y creemos
                    que mantener un vehículo en buenas condiciones no debería
                    ser complicado.
                </p>

                <p>
                    Somos una tienda dedicada a la venta de repuestos,
                    accesorios y productos para la mantención de automóviles,
                    ofreciendo soluciones pensadas para conductores y amantes
                    de los vehículos que buscan calidad, confianza y buenos
                    precios.
                </p>

                <p>
                    Nuestro objetivo es facilitar el acceso a los productos
                    necesarios para el cuidado y mantenimiento de tu auto,
                    desde repuestos y elementos de mantención hasta accesorios
                    que ayudan a mejorar su funcionamiento y apariencia.
                </p>

                <p>
                    En AutoCarePro trabajamos para entregar una experiencia de
                    compra sencilla y confiable, ayudándote a encontrar lo que
                    necesitas para que tu vehículo siga funcionando de la
                    mejor manera.
                </p>

                <h5 className="mt-4">
                    AutoCarePro — Tu auto, siempre en buenas manos.
                </h5>


                <img
                    src="/images/Tienda.png"
                    alt="Tienda AutoCarePro"
                    className="img-fluid rounded mt-4"
                    style={{
                        maxHeight: '420px',
                        objectFit: 'contain'
                    }}
                />


                <hr className="my-5" />


                <section>

                    <h2 className="h4 mb-3">
                        Equipo de Desarrollo
                    </h2>

                    <p className="mb-1">
                        Proyecto desarrollado por:
                    </p>

                    <p className="mb-2">

                        <strong>
                            Nicolás Aballais
                        </strong>

                        {' y '}

                        <strong>
                            Ricardo Peralta
                        </strong>

                    </p>

                    <p className="text-muted mb-0">
                        Estudiantes Analistas Programadores,
                        Duoc UC, Sede Puente Alto.
                    </p>

                </section>

            </section>

        </main>
    );
}