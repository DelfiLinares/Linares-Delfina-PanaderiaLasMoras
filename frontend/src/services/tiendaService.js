import { apiRequest } from './api.js';

const carritoPath = (dni) => `/carritos/${encodeURIComponent(dni)}`;
const itemPath = (dni, codigo) => `${carritoPath(dni)}/items/${encodeURIComponent(codigo)}`;

export function getClient(dni) {
    return apiRequest(`/clientes/${encodeURIComponent(dni)}`);
}

export function createClient(data) {
    return apiRequest('/clientes', { method: 'POST', data });
}

export function getCart(dni) {
    return apiRequest(carritoPath(dni));
}

export function addCartItem(dni, codigo, cantidad) {
    return apiRequest(`${carritoPath(dni)}/items`, { method: 'POST', data: { codigo, cantidad } });
}

export function updateCartItem(dni, codigo, cantidad) {
    return apiRequest(itemPath(dni, codigo), { method: 'PUT', data: { cantidad } });
}

export function removeCartItem(dni, codigo) {
    return apiRequest(itemPath(dni, codigo), { method: 'DELETE' });
}

export function clearCart(dni) {
    return apiRequest(carritoPath(dni), { method: 'DELETE' });
}

export function getOrders(dni, signal) {
    return apiRequest(`/pedidos?dni=${encodeURIComponent(dni)}`, { signal });
}

export function confirmOrder(dni) {
    return apiRequest('/pedidos', { method: 'POST', data: { dni } });
}

export function cancelOrder(numero, dni) {
    return apiRequest(`/pedidos/${encodeURIComponent(numero)}/cancelar`, { method: 'POST', data: { dni } });
}
