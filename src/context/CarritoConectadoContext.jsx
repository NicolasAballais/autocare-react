import { createContext, useContext, useRef, useState } from 'react';
import { esObjectId, lineaCarritoConectado, mismoIdProducto } from '../services/carritoService.js';
import { idOrdenSinConfirmar, validarOrdenConfirmada } from '../services/ordenesApi.js';

const CarritoConectadoContext = createContext();
const CLAVE = 'carritoConectadoAutoCare';
const ESTADO_INICIAL = { carrito: [], intento: null, ordenConfirmada: null };

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
    const actual = useRef(estado);
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const consultaEnCurso = useRef(false);

    function guardarEstado(nuevoEstado) {
        localStorage.setItem(CLAVE, JSON.stringify(nuevoEstado));
        actual.current = nuevoEstado;
        setEstado(nuevoEstado);
    }

    function actualizarCarrito(actualizar) {
        if (actual.current.intento) return;
        const carrito = actualizar(actual.current.carrito);
        guardarEstado({ ...actual.current, carrito, ordenConfirmada: null });
        setMensaje('');
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

    function guardarConfirmacion(orden) {
        guardarEstado({ carrito: [], intento: null, ordenConfirmada: orden });
        setMensaje('');
    }

    async function consultarPendiente(consultar, id = actual.current.intento?.id) {
        if (!id || consultaEnCurso.current) return;
        consultaEnCurso.current = true;
        setProcesando(true);
        try {
            guardarConfirmacion(validarOrdenConfirmada(await consultar(id), id));
        } catch {
            setMensaje('La orden sigue sin confirmación. Puedes volver a consultarla.');
        } finally {
            consultaEnCurso.current = false;
            setProcesando(false);
        }
    }

    async function registrarCompra(solicitud, enviar, consultar) {
        if (actual.current.intento || actual.current.ordenConfirmada) return;
        try {
            // Persistir antes del POST impide repetir el envío al recargar o volver a esta pantalla.
            guardarEstado({ ...actual.current, intento: {} });
        } catch {
            setMensaje('No se pudo guardar el intento de compra. El envío quedó bloqueado.');
            return;
        }
        setProcesando(true);
        setMensaje('');
        try {
            guardarConfirmacion(validarOrdenConfirmada(await enviar(solicitud)));
        } catch (error) {
            if ([400, 404, 409].includes(error.estado)) {
                guardarEstado({ ...actual.current, intento: null });
                const motivo = { 400: 'Datos inválidos.', 404: 'Uno de los productos ya no está disponible.',
                    409: 'Stock insuficiente o conflicto de inventario.' };
                setMensaje(`${motivo[error.estado]} ${error.message}`);
            } else {
                const id = idOrdenSinConfirmar(error);
                if (id) {
                    guardarEstado({ ...actual.current, intento: { id } });
                    await consultarPendiente(consultar, id);
                } else {
                    setMensaje('La compra quedó sin confirmación. Conservamos el carrito para verificar el resultado.');
                }
            }
        } finally {
            setProcesando(false);
        }
    }

    const cantidadTotal = estado.carrito.reduce((suma, linea) => suma + linea.cantidad, 0);
    return (
        <CarritoConectadoContext.Provider value={{ ...estado, cantidadTotal, agregarProducto, cambiarCantidad,
            eliminarProducto, aplicarPropuesta, registrarCompra, consultarPendiente, procesando, mensaje }}>
            {children}
        </CarritoConectadoContext.Provider>
    );
}

export function useCarritoConectado() {
    return useContext(CarritoConectadoContext);
}
