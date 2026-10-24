const CLAVE_USUARIOS = 'usuariosAutoCare';
const CLAVE_SESION = 'sesionAutoCare';

const USUARIOS_INICIALES = [
    {
        id: 1,
        nombre: 'Administrador',
        apellido: 'AutoCare',
        correo: 'admin@autocare.cl',
        password: 'admin123',
        rol: 'admin'
    }
];


export function obtenerUsuarios() {

    const datos = localStorage.getItem(CLAVE_USUARIOS);

    if (datos) {
        return JSON.parse(datos);
    }

    localStorage.setItem(
        CLAVE_USUARIOS,
        JSON.stringify(USUARIOS_INICIALES)
    );

    return USUARIOS_INICIALES;
}


export function registrarUsuario(usuario) {

    const usuarios = obtenerUsuarios();

    const correoExiste = usuarios.some(
        (item) =>
            item.correo.toLowerCase() ===
            usuario.correo.toLowerCase()
    );

    if (correoExiste) {

        return {
            exito: false,
            mensaje: 'Ya existe un usuario registrado con ese correo.'
        };
    }

    const nuevoUsuario = {
        ...usuario,
        id: Date.now(),
        rol: 'cliente'
    };

    const usuariosActualizados = [
        ...usuarios,
        nuevoUsuario
    ];

    localStorage.setItem(
        CLAVE_USUARIOS,
        JSON.stringify(usuariosActualizados)
    );

    return {
        exito: true,
        usuario: nuevoUsuario
    };
}


export function iniciarSesion(correo, password) {

    const usuarios = obtenerUsuarios();

    const usuario = usuarios.find(
        (item) =>
            item.correo.toLowerCase() ===
            correo.toLowerCase()
            &&
            item.password === password
    );

    if (!usuario) {

        return {
            exito: false,
            mensaje: 'Correo o contraseña incorrectos.'
        };
    }

    localStorage.setItem(
        CLAVE_SESION,
        JSON.stringify(usuario)
    );

    return {
        exito: true,
        usuario
    };
}


export function obtenerSesion() {

    const datos =
        localStorage.getItem(CLAVE_SESION);

    return datos
        ? JSON.parse(datos)
        : null;
}


export function cerrarSesion() {

    localStorage.removeItem(CLAVE_SESION);
}


export function actualizarUsuarioPerfil(
    id,
    datosActualizados
) {

    const usuarios = obtenerUsuarios();

    const usuariosActualizados =
        usuarios.map((usuario) => {

            if (
                usuario.id !== Number(id)
            ) {
                return usuario;
            }

            return {
                ...usuario,
                ...datosActualizados
            };
        });

    localStorage.setItem(
        CLAVE_USUARIOS,
        JSON.stringify(
            usuariosActualizados
        )
    );

    const usuarioActualizado =
        usuariosActualizados.find(
            (usuario) =>
                usuario.id === Number(id)
        );

    const sesion = obtenerSesion();

    if (
        sesion &&
        sesion.id === Number(id)
    ) {

        localStorage.setItem(
            CLAVE_SESION,
            JSON.stringify(
                usuarioActualizado
            )
        );
    }

    return usuarioActualizado;
}


/* =========================================
   FUNCIONES PARA ADMINISTRACIÓN DE USUARIOS
   ========================================= */


export function obtenerUsuarioPorId(id) {

    const usuarios = obtenerUsuarios();

    return usuarios.find(
        (usuario) =>
            usuario.id === Number(id)
    ) || null;
}


export function obtenerClientes() {

    const usuarios = obtenerUsuarios();

    return usuarios.filter(
        (usuario) =>
            usuario.rol === 'cliente'
    );
}


export function actualizarUsuarioAdmin(
    id,
    datosActualizados
) {

    const usuarios = obtenerUsuarios();

    const usuarioActual =
        usuarios.find(
            (usuario) =>
                usuario.id === Number(id)
        );

    if (!usuarioActual) {

        return {
            exito: false,
            mensaje: 'Usuario no encontrado.'
        };
    }

    const correoNuevo =
        datosActualizados.correo
            .trim()
            .toLowerCase();

    const correoDuplicado =
        usuarios.some(
            (usuario) =>
                usuario.id !== Number(id)
                &&
                usuario.correo.toLowerCase() ===
                    correoNuevo
        );

    if (correoDuplicado) {

        return {
            exito: false,
            mensaje:
                'Ya existe otro usuario con ese correo.'
        };
    }

    const usuariosActualizados =
        usuarios.map((usuario) => {

            if (
                usuario.id !== Number(id)
            ) {
                return usuario;
            }

            return {
                ...usuario,

                nombre:
                    datosActualizados.nombre.trim(),

                apellido:
                    datosActualizados.apellido.trim(),

                correo:
                    datosActualizados.correo.trim(),

                telefono:
                    datosActualizados.telefono
                        ?.trim() || '',

                comuna:
                    datosActualizados.comuna
                        ?.trim() || '',

                direccion:
                    datosActualizados.direccion
                        ?.trim() || ''
            };
        });

    localStorage.setItem(
        CLAVE_USUARIOS,
        JSON.stringify(
            usuariosActualizados
        )
    );

    const usuarioActualizado =
        usuariosActualizados.find(
            (usuario) =>
                usuario.id === Number(id)
        );

    const sesion = obtenerSesion();

    if (
        sesion &&
        sesion.id === Number(id)
    ) {

        localStorage.setItem(
            CLAVE_SESION,
            JSON.stringify(
                usuarioActualizado
            )
        );
    }

    return {
        exito: true,
        usuario: usuarioActualizado
    };
}