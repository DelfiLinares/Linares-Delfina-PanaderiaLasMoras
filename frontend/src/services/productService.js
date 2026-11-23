import { apiRequest } from './api.js';

const productPath = (codigo) => `/products/${encodeURIComponent(codigo)}`;

export function getProducts(signal) {
    return apiRequest('/products', { signal });
}

export function getProduct(codigo, signal) {
    return apiRequest(productPath(codigo), { signal });
}

export function createProduct(data) {
    return apiRequest('/products', { method: 'POST', data });
}

export function updateProduct(codigo, data) {
    return apiRequest(productPath(codigo), { method: 'PUT', data });
}

export function deleteProduct(codigo) {
    return apiRequest(productPath(codigo), { method: 'DELETE' });
}