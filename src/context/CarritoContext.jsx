import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';
import { esIdProductoLocal, mismoIdProducto } from '../services/carritoService.js';
import { CarritoConectadoProvider } from './CarritoConectadoContext.jsx';

const CarritoContext = createContext();

const CLAVE_CARRITO = 'carritoAutoCare';

function obtenerCarritoGuardado() {
    try {
        const carritoGuardado =
            localStorage.getItem(CLAVE_CARRITO);

        return carritoGuardado
            ? JSON.parse(carritoGuardado)
            : [];
    } catch {
        return [];
    }
}

export function CarritoProvider({ children }) {

    const [carrito, setCarrito] =
        useState(obtenerCarritoGuardado);
    const ultimoCarritoGuardado = useRef(carrito);

    useEffect(() => {
        if (carrito === ultimoCarritoGuardado.current) return;

        localStorage.setItem(
            CLAVE_CARRITO,
            JSON.stringify(carrito)
        );
        ultimoCarritoGuardado.current = carrito;
    }, [carrito]);

    const agregarProducto = (producto) => {
        if (!esIdProductoLocal(producto.id) || !Number.isSafeInteger(producto.stock) || producto.stock < 1) return;

        setCarrito((carritoActual) => {

            const existente =
                carritoActual.find(
                    (item) => mismoIdProducto(item.id, producto.id)
                );

            if (existente) {

                return carritoActual.map((item) => {

                    if (!mismoIdProducto(item.id, producto.id)) {
                        return item;
                    }

                    const nuevaCantidad =
                        Math.min(
                            (Number.isSafeInteger(item.cantidad) && item.cantidad > 0 ? item.cantidad : 0) + 1,
                            producto.stock
                        );

                    return {
                        ...item,
                        stock: producto.stock,
                        cantidad: nuevaCantidad
                    };
                });
            }

            return [
                ...carritoActual,
                {
                    ...producto,
                    cantidad: 1
                }
            ];
        });
    };

    const eliminarProducto = (id) => {
        setCarrito((carritoActual) =>
            carritoActual.filter(
                (item) => !mismoIdProducto(item.id, id)
            )
        );
    };

    const cambiarCantidad = (id, cantidad) => {
        if (!Number.isSafeInteger(cantidad) || cantidad < 1) return;

        setCarrito((carritoActual) =>
            carritoActual.map((item) => {

                if (!mismoIdProducto(item.id, id) || !Number.isSafeInteger(item.stock) || item.stock < 1) {
                    return item;
                }

                const cantidadValida = Math.min(cantidad, item.stock);

                return {
                    ...item,
                    cantidad: cantidadValida
                };
            })
        );
    };

    const vaciarCarrito = () => {
        setCarrito([]);
    };

    const cantidadTotal =
        carrito.reduce(
            (total, item) =>
                total + item.cantidad,
            0
        );

    const total =
        carrito.reduce(
            (suma, item) =>
                suma +
                item.precio * item.cantidad,
            0
        );

    return (
        <CarritoContext.Provider
            value={{
                carrito,
                agregarProducto,
                eliminarProducto,
                cambiarCantidad,
                vaciarCarrito,
                cantidadTotal,
                total
            }}
        >
            <CarritoConectadoProvider>{children}</CarritoConectadoProvider>
        </CarritoContext.Provider>
    );
}

export function useCarrito() {
    return useContext(CarritoContext);
}
