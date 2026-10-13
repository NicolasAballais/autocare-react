export default function Login() {
    return (
        <div className="row justify-content-center py-5">
            <div className="col-md-5">
                <div className="card shadow">
                    <div className="card-body p-5">
                        <div className="text-center mb-3">
                            <div className="fs-1 text-danger">
                                <i className="bi bi-speedometer2"></i>
                            </div>
                            <h2 className="h4 fw-bold mb-0">
                                AutoCare
                                <span className="text-danger">
                                    Pro
                                </span>
                            </h2>
                        </div>
                        <h2 className="text-center mb-4">Iniciar Sesión</h2>
                    
                        <form id="loginForm" noValidate>
                            <div className="mb-3">
                                <label htmlFor="emailLogin" className="form-label">Correo Electrónico</label>
                                <input type="email" className="form-control" id="emailLogin" placeholder="ejemplo@duoc.cl"/>
                                
                                <div id="emailError" className="text-danger mt-1 fw-bold" ></div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="passLogin" className="form-label">Contraseña</label>
                                <input type="password" className="form-control" id="passLogin"/>
                                
                                <div id="passError" className="text-danger mt-1 fw-bold" ></div>
                            </div>
                            <button type="submit" className="btn btn-danger w-100 btn-lg">Ingresar</button>
                            <div className="text-center mt-4">
                                <p>¿No tienes cuenta? <a href="register.html" className="text-danger fw-bold text-decoration-none">Regí­strate aquí</a></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
