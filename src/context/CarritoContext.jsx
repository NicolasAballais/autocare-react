import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';

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

    useEffect(() => {
        localStorage.setItem(
            CLAVE_CARRITO,
            JSON.stringify(carrito)
        );
    }, [carrito]);

    const agregarProducto = (producto) => {

        setCarrito((carritoActual) => {

            const existente =
                carritoActual.find(
                    (item) => item.id === producto.id
                );

            if (existente) {

                return carritoActual.map((item) => {

                    if (item.id !== producto.id) {
                        return item;
                    }

                    const nuevaCantidad =
                        Math.min(
                            item.cantidad + 1,
                            producto.stock
                        );

                    return {
                        ...item,
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
                (item) => item.id !== id
            )
        );
    };

    const cambiarCantidad = (id, cantidad) => {

        setCarrito((carritoActual) =>
            carritoActual.map((item) => {

                if (item.id !== id) {
                    return item;
                }

                const cantidadValida =
                    Math.max(
                        1,
                        Math.min(
                            cantidad,
                            item.stock
                        )
                    );

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
            {children}
        </CarritoContext.Provider>
    );
}

export function useCarrito() {
    return useContext(CarritoContext);
}