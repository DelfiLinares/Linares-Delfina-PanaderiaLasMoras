import { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '../services/api.js';
import { addCartItem, clearCart, confirmOrder, createClient, getCart, getClient, removeCartItem, updateCartItem } from '../services/tiendaService.js';
import { createEmployee, getCurrentEmployee, loginEmployee, logoutEmployee } from '../services/empleadoService.js';

const STORAGE_KEY = 'lasmoras.sesion';
const TiendaContext = createContext(null);

function readSession() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
        return null;
    }
}

export function TiendaProvider({ children }) {
    const [cliente, setCliente] = useState(null);
    const [empleado, setEmpleado] = useState(null);
    const [carrito, setCarrito] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const saved = readSession();
        let restore = Promise.resolve();
        if (saved?.rol === 'empleado') {
            setAuthToken(saved.token);
            restore = getCurrentEmployee().then(setEmpleado);
        } else if (saved?.rol === 'cliente') {
            restore = Promise.all([getClient(saved.dni), getCart(saved.dni)])
                .then(([savedClient, savedCart]) => { setCliente(savedClient); setCarrito(savedCart); });
        }
        restore
            .catch(() => { setAuthToken(null); localStorage.removeItem(STORAGE_KEY); })
            .finally(() => setReady(true));
    }, []);

    async function startClient(client) {
        const cart = await getCart(client.dni);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ rol: 'cliente', dni: client.dni }));
        setCliente(client);
        setCarrito(cart);
        return client;
    }

    function startEmployee({ empleado: employee, token }) {
        setAuthToken(token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ rol: 'empleado', token }));
        setEmpleado(employee);
        return employee;
    }

    const value = {
        cliente,
        empleado,
        rol: empleado ? 'empleado' : cliente ? 'cliente' : null,
        carrito,
        ready,
        loginCliente: async (dni) => startClient(await getClient(dni.trim())),
        registerCliente: async (data) => startClient(await createClient(data)),
        loginEmpleado: async (dni, codigo) => startEmployee(await loginEmployee(dni.trim(), codigo)),
        registerEmpleado: async (data) => {
            await createEmployee(data);
            return startEmployee(await loginEmployee(data.dni, data.codigo));
        },
        async logout() {
            if (empleado) {
                await logoutEmployee().catch(() => {});
            }
            setAuthToken(null);
            localStorage.removeItem(STORAGE_KEY);
            setCliente(null);
            setEmpleado(null);
            setCarrito(null);
        },
        addItem: async (codigo, cantidad = 1) => setCarrito(await addCartItem(cliente.dni, codigo, cantidad)),
        changeQuantity: async (codigo, cantidad) => setCarrito(await updateCartItem(cliente.dni, codigo, cantidad)),
        removeItem: async (codigo) => setCarrito(await removeCartItem(cliente.dni, codigo)),
        emptyCart: async () => setCarrito(await clearCart(cliente.dni)),
        async checkout() {
            const pedido = await confirmOrder(cliente.dni);
            setCarrito(await getCart(cliente.dni));
            return pedido;
        }
    };

    return <TiendaContext value={value}>{children}</TiendaContext>;
}

export function useTienda() {
    return useContext(TiendaContext);
}
