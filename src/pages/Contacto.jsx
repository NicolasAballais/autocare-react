export default function Contacto() {
    return(
        <div class="row justify-content-center p-5">
            <div class="col-md-8">
                <div class="card shadow">
                    <div class="card-body p-5">
                        <h2 class="text-center mb-4">Formulario de Contacto</h2>
                        
                        <form id="contactForm" novalidate>
                            <div class="mb-3">
                                <label for="nombreContacto" class="form-label">Nombre Completo</label>
                                <input type="text" class="form-control" id="nombreContacto" placeholder="Tu nombre"/>
                                <div id="nombreError" class="text-danger mt-1 fw-bold" ></div>
                            </div>
                            <div class="mb-3">
                                <label for="emailContacto" class="form-label">Correo Electrónico</label>
                                <input type="email" class="form-control" id="emailContacto" placeholder="ejemplo@duoc.cl"/>
                                <div id="emailContactError" class="text-danger mt-1 fw-bold" ></div>
                            </div>
                            <div class="mb-4">
                                <label for="comentarioContacto" class="form-label">Mensaje o Comentario</label>
                                <textarea class="form-control" id="comentarioContacto" rows="4" placeholder="Escribe tu mensaje aquí..."></textarea>
                                <div id="comentarioError" class="text-danger mt-1 fw-bold" ></div>
                            </div>
                            <button type="submit" class="btn btn-danger w-100 btn-lg">Enviar Mensaje</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}