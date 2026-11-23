import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { esObjectId, lineaCarritoConectado, mismoIdProducto, normalizarIdProducto } from '../services/carritoService.js';
import { EnvioOrdenBloqueado, generarClaveOrden, mismosProductos, prepararSolicitudOrden,
    solicitudDelIntento, validarOrdenConfirmada } from '../services/ordenesApi.js';

const CarritoConectadoContext = createContext();
const CLAVE = 'carritoConectadoAutoCare';
const ESTADO_INICIAL = { carrito: [], intento: null, ordenConfirmada: null };
const MOTIVOS_RECHAZO = { 400: 'Datos inválidos.', 404: 'Uno de los productos ya no está disponible.',
    409: 'Stock insuficiente o conflicto de idempotencia o inventario.' };

function leerCarritoConectado() {
    try {
        const estado = JSON.parse(localStorage.getItem(CLAVE));
        if (Array.isArray(estado?.carrito)) return estado;
    } catch {
        // Se conserva el valor almacenado hasta que el usuario edite el carrito conectado.
    }
    return ESTADO_INICIAL;
}

export function CarritoConectadoProvider({ children }) {
    const [estado, setEstado] = useState(leerCarritoConectado);
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const operacionEnCurso = useRef(false);

    useEffect(() => {
        function sincronizar(evento) {
            if (evento.key === CLAVE) setEstado(leerCarritoConectado());
        }
        window.addEventListener('storage', sincronizar);
        return () => window.removeEventListener('storage', sincronizar);
    }, []);

    function guardarEstado(nuevoEstado) {
        localStorage.setItem(CLAVE, JSON.stringify(nuevoEstado));
        setEstado(nuevoEstado);
    }

    function actualizarCarrito(actualizar) {
        const actual = leerCarritoConectado();
        if (actual.intento || operacionEnCurso.current) return;
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
        const actual = leerCarritoConectado();
        if (actual.intento?.id === intento.id && actual.intento.cuerpo === intento.cuerpo) return actual;
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
            guardarConfirmacion(await consultar(intento.id), intento);
        } catch (error) {
            if (estadoDelIntento(intento)) {
                const detalle = error.estado === 404 ? '' : ` ${error.message}`;
                setMensaje({ texto: `La orden sigue sin confirmación. Puedes volver a consultarla.${detalle}` });
            }
        }
    }

    async function ejecutarOperacion(operacion) {
        if (operacionEnCurso.current) return;
        operacionEnCurso.current = true;
        setProcesando(true);
        setMensaje(null);
        try {
            // El bloqueo del navegador coordina pestañas de este origen cuando está disponible.
            if (navigator.locks) await navigator.locks.request(CLAVE, operacion);
            else await operacion();
        } catch {
            setMensaje({ texto: 'No se pudo guardar o actualizar el intento de compra. Comprueba su estado antes de reenviar.' });
        } finally {
            operacionEnCurso.current = false;
            setProcesando(false);
        }
    }

    async function enviarIntento(intento, enviar, consultar, reintento = false) {
        try {
            guardarConfirmacion(await enviar(intento), intento);
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
            } else {
                await consultarResultado(intento, consultar);
            }
        }
    }

    function registrarCompra(solicitud, enviar, consultar) {
        return ejecutarOperacion(async () => {
            const actual = leerCarritoConectado();
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
            const intento = previo?.cuerpo === cuerpo && solicitudDelIntento(previo) ? previo : { id: generarClaveOrden(), cuerpo };
            guardarEstado({ ...actual, intento, intentoRechazado: null });
            await enviarIntento(intento, enviar, consultar);
        });
    }

    function consultarPendiente(consultar) {
        return ejecutarOperacion(async () => {
            const { intento } = leerCarritoConectado();
            if (solicitudDelIntento(intento)) await consultarResultado(intento, consultar);
        });
    }

    function reintentarCompra(enviar, consultar) {
        return ejecutarOperacion(async () => {
            const { intento } = leerCarritoConectado();
            if (solicitudDelIntento(intento)) await enviarIntento(intento, enviar, consultar, true);
        });
    }

    const cantidadTotal = estado.carrito.reduce((suma, linea) => suma + linea.cantidad, 0);
    return (
        <CarritoConectadoContext.Provider value={{ ...estado, cantidadTotal, agregarProducto, cambiarCantidad,
            eliminarProducto, aplicarPropuesta, registrarCompra, consultarPendiente, reintentarCompra, procesando, mensaje }}>
            {children}
        </CarritoConectadoContext.Provider>
    );
}

export function useCarritoConectado() {
    return useContext(CarritoConectadoContext);
}
