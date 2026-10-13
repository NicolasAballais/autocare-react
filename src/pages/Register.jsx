export default function Register() {
    return(
        <div class="row justify-content-center p-5">
            <div class="col-md-7 col-lg-6">
                <div class="card shadow">
                    <div class="card-body p-5">
                        <h2 class="text-center mb-4">
                            Registro de Usuario
                        </h2>
                        <form id="registerForm" novalidate>
                            <div class="mb-3">
                                <label for="runReg" class="form-label">
                                    RUN
                                </label>
                                <input
                                    type="text"
                                    class="form-control"
                                    id="runReg"
                                    placeholder="Ej: 19011022K"
                                    minlength="7"
                                    maxlength="9"/>
                                <div
                                    id="runRegError"
                                    class="text-danger mt-1 fw-bold">
                                </div>
                                <div class="form-text">
                                    Ingresa el RUN sin puntos ni guion.
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="nombreReg" class="form-label">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    class="form-control"
                                    id="nombreReg"
                                    placeholder="Ej: Juan"
                                    maxlength="50"
                                    autocomplete="given-name"/>
                                <div
                                    id="nombreRegError"
                                    class="text-danger mt-1 fw-bold"
                                    >
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="apellidoReg" class="form-label">
                                    Apellidos
                                </label>
                                <input
                                    type="text"
                                    class="form-control"
                                    id="apellidoReg"
                                    placeholder="Ej: Pérez González"
                                    maxlength="100"
                                    autocomplete="family-name"/>
                                <div
                                    id="apellidoRegError"
                                    class="text-danger mt-1 fw-bold"
                                    >
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="emailReg" class="form-label">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    class="form-control"
                                    id="emailReg"
                                    placeholder="ejemplo@duoc.cl"
                                    maxlength="100"
                                    autocomplete="email"/>
                                <div
                                    id="emailRegError"
                                    class="text-danger mt-1 fw-bold">
                                </div>
                                <div class="form-text">
                                    Se permiten correos @duoc.cl,
                                    @profesor.duoc.cl y @gmail.com.
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="fechaNacimientoReg" class="form-label">
                                    Fecha de Nacimiento
                                    <span class="text-muted">(Opcional)</span>
                                </label>
                                <input
                                    type="date"
                                    class="form-control"
                                    id="fechaNacimientoReg"
                                    autocomplete="bday"/>
                                <div
                                    id="fechaNacimientoRegError"
                                    class="text-danger mt-1 fw-bold">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="regionReg" class="form-label">
                                    Región
                                </label>
                                <select
                                    class="form-select"
                                    id="regionReg"
                                    autocomplete="address-level1">
                                    <option value="">
                                        Seleccione una región
                                    </option>
                                </select>
                                <div
                                    id="regionRegError"
                                    class="text-danger mt-1 fw-bold">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="comunaReg" class="form-label">
                                    Comuna
                                </label>
                                <select
                                    class="form-select"
                                    id="comunaReg"
                                    autocomplete="address-level2"
                                    disabled>
                                    <option value="">
                                        Seleccione primero una región
                                    </option>
                                </select>
                                <div
                                    id="comunaRegError"
                                    class="text-danger mt-1 fw-bold">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="direccionReg" class="form-label">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    class="form-control"
                                    id="direccionReg"
                                    placeholder="Ej: Av. Vicuña Mackenna 1234"
                                    maxlength="300"
                                    autocomplete="street-address"/>
                                <div
                                    id="direccionRegError"
                                    class="text-danger mt-1 fw-bold">
                                </div>
                            </div>
                            <div class="mb-4">
                                <label for="passReg" class="form-label">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    class="form-control"
                                    id="passReg"
                                    placeholder="4 a 10 caracteres"
                                    minlength="4"
                                    maxlength="10"
                                    autocomplete="new-password"/>
                                <div
                                    id="passRegError"
                                    class="text-danger mt-1 fw-bold">
                                </div>
                                <div class="form-text">
                                    La contraseña debe contener entre
                                    4 y 10 caracteres.
                                </div>
                            </div>
                            <button
                                type="submit"
                                class="btn btn-danger w-100 btn-lg">
                                Registrar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}