import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { esObjectId, lineaCarritoConectado, mismoIdProducto, normalizarIdProducto } from '../services/carritoService.js';
import { EnvioOrdenBloqueado, generarClaveOrden, mismosProductos, prepararSolicitudOrden,
    solicitudDelIntento, validarOrdenConfirmada } from '../services/ordenesApi.js';
import { useSesionConectada } from './sesionConectada.js';

const CarritoConectadoContext = createContext();
const CLAVE = 'carritoConectadoAutoCare';
const ESTADO_INICIAL = { carrito: [], intento: null, ordenConfirmada: null };
const MOTIVOS_RECHAZO = { 400: 'Datos inválidos.', 404: 'Uno de los productos ya no está disponible.',
    409: 'Stock insuficiente o conflicto de idempotencia o inventario.' };

function leerAlmacenamiento(clave) {
    try {
        return JSON.parse(localStorage.getItem(clave));
    } catch {
        return null;
    }
}

function leerCarritoConectado(clave, compradorId) {
    const estado = leerAlmacenamiento(clave);
    if (!Array.isArray(estado?.carrito)) return ESTADO_INICIAL;
    return {
        carrito: estado.carrito,
        intento: compradorId && estado.intento?.compradorId === compradorId ? estado.intento : null,
        intentoRechazado: compradorId && estado.intentoRechazado?.compradorId === compradorId ? estado.intentoRechazado : null,
        ordenConfirmada: compradorId && estado.compradorId === compradorId ? estado.ordenConfirmada : null
    };
}

export function CarritoConectadoProvider({ children }) {
    const sesion = useSesionConectada();
    const compradorId = sesion.usuario?.id;
    const puedeComprar = ['ADMIN', 'CLIENTE'].includes(sesion.usuario?.rol);
    const clave = compradorId ? `${CLAVE}:${compradorId}` : CLAVE;
    const leer = () => leerCarritoConectado(clave, compradorId);
    const [vista, setVista] = useState(() => ({ clave, datos: leer() }));
    const [procesos, setProcesos] = useState([]);
    const [aviso, setAviso] = useState(null);
    const operaciones = useRef(new Set());
    const estado = vista.clave === clave ? vista.datos : leer();
    const procesando = procesos.includes(clave);
    const mensaje = aviso?.clave === clave ? aviso.mensaje : null;
    const setEstado = (datos) => setVista({ clave, datos });
    const setMensaje = (mensajeNuevo) => setAviso({ clave, mensaje: mensajeNuevo });

    useEffect(() => {
        function sincronizar(evento) {
            if (evento.key === clave) setVista({ clave, datos: leerCarritoConectado(clave, compradorId) });
        }
        window.addEventListener('storage', sincronizar);
        return () => window.removeEventListener('storage', sincronizar);
    }, [clave, compradorId]);

    function guardarEstado(nuevoEstado) {
        const datos = compradorId ? { ...nuevoEstado, compradorId } :
            { ...leerAlmacenamiento(clave), carrito: nuevoEstado.carrito };
        localStorage.setItem(clave, JSON.stringify(datos));
        setEstado(nuevoEstado);
    }

    function actualizarCarrito(actualizar) {
        const actual = leer();
        if (sesion.usuario?.rol === 'VENDEDOR' || actual.intento || operaciones.current.has(clave)) return;
        const carrito = actualizar(actual.carrito);
        guardarEstado({ ...actual, carrito, ordenConfirmada: null });
        setMensaje(null);
    }

    function agregarProducto(producto) {
        if (!esObjectId(producto.id) || !Number.isInteger(producto.stock) || producto.stock < 1 ||
            !Number.isFinite(producto.precioFinal) || producto.precioFinal < 0) return;
        actualizarCarrito((carrito) => {
            const previa = carrito.find((linea) => mismoIdProducto(linea.id, producto.id));
            if (!previa) return [...carrito, lineaCarritoConectado(producto, 1)];
            const cantidad = previa.cantidad < producto.stock ? previa.cantidad + 1 : previa.cantidad;
            return carrito.map((linea) => linea === previa ? lineaCarritoConectado(producto, cantidad) : linea);
        });
    }

    function cambiarCantidad(id, cantidad, stock) {
        if (!Number.isInteger(cantidad) || cantidad < 1 || !Number.isInteger(stock) || cantidad > stock) return;
        actualizarCarrito((carrito) => carrito.map((linea) =>
            mismoIdProducto(linea.id, id) ? { ...linea, cantidad } : linea));
    }

    function eliminarProducto(id) {
        actualizarCarrito((carrito) => carrito.filter((linea) => !mismoIdProducto(linea.id, id)));
    }

    function aplicarPropuesta(propuesta) {
        actualizarCarrito((carrito) => {
            const lineas = new Map(carrito.map((linea) => [linea.id, linea]));
            for (const linea of propuesta.carritoPropuesto) {
                const previa = lineas.get(linea.id);
                lineas.set(linea.id, { ...linea, cantidad: Math.max(previa?.cantidad ?? 0, linea.cantidad) });
            }
            return [...lineas.values()];
        });
    }

    function estadoDelIntento(intento) {
        const actual = leer();
        if (intento.compradorId === compradorId && actual.intento?.id === intento.id && actual.intento.cuerpo === intento.cuerpo) return actual;
        setEstado(actual);
        return null;
    }

    function guardarConfirmacion(respuesta, intento) {
        const orden = validarOrdenConfirmada(respuesta, intento);
        const actual = estadoDelIntento(intento);
        if (!actual) return;

        const confirmados = new Map(orden.productos.map(({ productoId, cantidad }) => [normalizarIdProducto(productoId), cantidad]));
        const carrito = actual.carrito.map((linea) => ({ ...linea,
            cantidad: linea.cantidad - (confirmados.get(normalizarIdProducto(linea.id)) ?? 0)
        })).filter((linea) => linea.cantidad > 0);
        guardarEstado({ carrito, intento: null, intentoRechazado: null, ordenConfirmada: orden });
        setMensaje(null);
    }

    async function consultarResultado(intento, consultar) {
        try {
            guardarConfirmacion(await sesion.solicitar((token) => consultar(intento.id, token), compradorId), intento);
        } catch (error) {
            if (estadoDelIntento(intento)) {
                const detalle = error.estado === 404 ? '' : error.estado === 403 ? ' No tienes permiso para consultar esta orden.' :
                    error.estado === 401 ? ' Inicia sesión con la cuenta que hizo el intento.' : ` ${error.message}`;
                setMensaje({ texto: `La orden sigue sin confirmación. Puedes volver a consultarla.${detalle}` });
            }
        }
    }

    async function ejecutarOperacion(operacion) {
        if (!puedeComprar || !esObjectId(compradorId) || operaciones.current.has(clave)) return;
        operaciones.current.add(clave);
        setProcesos((actuales) => [...actuales, clave]);
        setMensaje(null);
        try {
            // El bloqueo del navegador coordina pestañas de este origen cuando está disponible.
            if (navigator.locks) await navigator.locks.request(clave, operacion);
            else await operacion();
        } catch {
            setMensaje({ texto: 'No se pudo guardar o actualizar el intento de compra. Comprueba su estado antes de reenviar.' });
        } finally {
            operaciones.current.delete(clave);
            setProcesos((actuales) => actuales.filter((item) => item !== clave));
        }
    }

    async function enviarIntento(intento, enviar, consultar, reintento = false) {
        try {
            guardarConfirmacion(await sesion.solicitar((token) => enviar(intento, token), compradorId), intento);
        } catch (error) {
            const actual = estadoDelIntento(intento);
            if (!actual) return;
            const envioBloqueado = error instanceof EnvioOrdenBloqueado;
            const stockInsuficiente = error.estado === 409 && /^Stock insuficiente/i.test(error.message);
            const rechazoDefinitivo = envioBloqueado || [400, 404].includes(error.estado) || stockInsuficiente;
            if (rechazoDefinitivo && !reintento) {
                guardarEstado({ ...actual, intento: null, intentoRechazado: intento });
            }
            const motivo = MOTIVOS_RECHAZO[error.estado];
            if (motivo || envioBloqueado) {
                setMensaje({ texto: [motivo, error.message].filter(Boolean).join(' '), campos: error.campos });
            } else if (error.estado === 401 || error.estado === 403) {
                setMensaje({ texto: error.estado === 401 ? 'Inicia sesión con la cuenta que hizo el intento.' :
                    'La cuenta no tiene permiso para completar esta compra.' });
            } else {
                await consultarResultado(intento, consultar);
            }
        }
    }

    function registrarCompra(solicitud, enviar, consultar) {
        return ejecutarOperacion(async () => {
            const actual = leer();
            if (actual.intento || actual.ordenConfirmada) {
                setEstado(actual);
                return;
            }
            if (!actual.carrito.length || !mismosProductos(solicitud.productos, prepararSolicitudOrden(actual.carrito).productos)) {
                setEstado(actual);
                setMensaje({ texto: 'El carrito cambió. Revisa los productos antes de confirmar.' });
                return;
            }
            const cuerpo = JSON.stringify(solicitud);
            const previo = actual.intentoRechazado;
            const intento = previo?.cuerpo === cuerpo && solicitudDelIntento(previo) ? previo :
                { id: generarClaveOrden(), cuerpo, compradorId };
            guardarEstado({ ...actual, intento, intentoRechazado: null });
            await enviarIntento(intento, enviar, consultar);
        });
    }

    function consultarPendiente(consultar) {
        return ejecutarOperacion(async () => {
            const { intento } = leer();
            if (solicitudDelIntento(intento)) await consultarResultado(intento, consultar);
        });
    }

    function reintentarCompra(enviar, consultar) {
        return ejecutarOperacion(async () => {
            const { intento } = leer();
            if (solicitudDelIntento(intento)) await enviarIntento(intento, enviar, consultar, true);
        });
    }

    const cantidadTotal = estado.carrito.reduce((suma, linea) => suma + linea.cantidad, 0);
    const carritoSinSesion = puedeComprar ? leerCarritoConectado(CLAVE).carrito : [];
    return (
        <CarritoConectadoContext.Provider value={{ ...estado, cantidadTotal, agregarProducto, cambiarCantidad,
            eliminarProducto, aplicarPropuesta, registrarCompra, consultarPendiente, reintentarCompra, procesando, mensaje,
            carritoSinSesion }}>
            {children}
        </CarritoConectadoContext.Provider>
    );
}

export function useCarritoConectado() {
    return useContext(CarritoConectadoContext);
}
