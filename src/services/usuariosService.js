import usuariosIniciales from '../data/usuarios.json';

const CLAVE_USUARIOS = 'usuariosAutoCare';
const CLAVE_SESION = 'sesionAutoCare';

function sinCredenciales(usuario) {
    const datos = { ...usuario };
    delete datos.password;
    delete datos.hashLocal;
    delete datos.salLocal;
    return datos;
}

async function calcularHashLocal(password, sal) {
    const clave = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({
        name: 'PBKDF2', salt: new Uint8Array(sal), iterations: 100000, hash: 'SHA-256'
    }, clave, 256);
    return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function guardarUsuarios(usuarios) {
    const protegidos = await Promise.all(usuarios.map(async (usuario) => {
        if (typeof usuario.password !== 'string') return usuario;
        const salLocal = Array.from(crypto.getRandomValues(new Uint8Array(16)));
        const hashLocal = await calcularHashLocal(usuario.password, salLocal);
        return { ...sinCredenciales(usuario), hashLocal, salLocal };
    }));
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(protegidos));
}

export function obtenerUsuarios() {
    const datos = localStorage.getItem(CLAVE_USUARIOS);

    if (datos) {
        return JSON.parse(datos);
    }

    return usuariosIniciales.map((usuario) => ({ ...usuario }));
}

export async function registrarUsuario(usuario) {
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

    await guardarUsuarios(usuariosActualizados);

    return {
        exito: true,
        usuario: sinCredenciales(nuevoUsuario)
    };
}

export async function iniciarSesion(correo, password) {
    const usuarios = obtenerUsuarios();

    const usuario = usuarios.find(
        (item) => item.correo.toLowerCase() === correo.toLowerCase()
    );

    const coincide = usuario?.hashLocal
        ? await calcularHashLocal(password, usuario.salLocal) === usuario.hashLocal
        : usuario?.password === password;
    if (!usuario || !coincide) {
        return {
            exito: false,
            mensaje: 'Correo o contraseña incorrectos.'
        };
    }

    if (usuarios.some((item) => typeof item.password === 'string')) await guardarUsuarios(usuarios);
    const sesion = sinCredenciales(usuario);
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));

    return { exito: true, usuario: sesion };
}

export function obtenerSesion() {
    const datos = localStorage.getItem(CLAVE_SESION);
    const guardada = datos ? JSON.parse(datos) : null;
    if (!guardada) return null;
    const sesion = sinCredenciales(guardada);
    if ('password' in guardada || 'hashLocal' in guardada || 'salLocal' in guardada) {
        localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    }
    return sesion;
}

export function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
}

export async function actualizarUsuarioPerfil(id, datosActualizados) {
    const usuarios = obtenerUsuarios();

    const usuariosActualizados = usuarios.map((usuario) =>
        usuario.id === Number(id)
            ? { ...usuario, ...datosActualizados }
            : usuario
    );

    await guardarUsuarios(usuariosActualizados);

    const usuarioActualizado = usuariosActualizados.find(
        (usuario) => usuario.id === Number(id)
    );

    const sesion = obtenerSesion();

    if (sesion && sesion.id === Number(id)) {
        localStorage.setItem(
            CLAVE_SESION,
            JSON.stringify(sinCredenciales(usuarioActualizado))
        );
    }

    return usuarioActualizado && sinCredenciales(usuarioActualizado);
}

export function obtenerUsuarioPorId(id) {
    const usuarios = obtenerUsuarios();

    return usuarios.find(
        (usuario) => usuario.id === Number(id)
    ) || null;
}

export function obtenerClientes() {
    return obtenerUsuarios().filter(
        (usuario) => usuario.rol === 'cliente'
    );
}

export async function actualizarUsuarioAdmin(id, datosActualizados) {
    const usuarios = obtenerUsuarios();

    const usuarioActual = usuarios.find(
        (usuario) => usuario.id === Number(id)
    );

    if (!usuarioActual) {
        return {
            exito: false,
            mensaje: 'Usuario no encontrado.'
        };
    }

    const correoNuevo = datosActualizados.correo.trim().toLowerCase();

    const correoDuplicado = usuarios.some(
        (usuario) =>
            usuario.id !== Number(id) &&
            usuario.correo.toLowerCase() === correoNuevo
    );

    if (correoDuplicado) {
        return {
            exito: false,
            mensaje: 'Ya existe otro usuario con ese correo.'
        };
    }

    const usuariosActualizados = usuarios.map((usuario) => {
        if (usuario.id !== Number(id)) {
            return usuario;
        }

        return {
            ...usuario,
            nombre: datosActualizados.nombre.trim(),
            apellido: datosActualizados.apellido.trim(),
            correo: datosActualizados.correo.trim(),
            telefono: datosActualizados.telefono?.trim() || '',
            comuna: datosActualizados.comuna?.trim() || '',
            direccion: datosActualizados.direccion?.trim() || ''
        };
    });

    await guardarUsuarios(usuariosActualizados);

    const usuarioActualizado = usuariosActualizados.find(
        (usuario) => usuario.id === Number(id)
    );

    const sesion = obtenerSesion();

    if (sesion && sesion.id === Number(id)) {
        localStorage.setItem(
            CLAVE_SESION,
            JSON.stringify(sinCredenciales(usuarioActualizado))
        );
    }

    return {
        exito: true,
        usuario: sinCredenciales(usuarioActualizado)
    };
}
