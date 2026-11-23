import { apiRequest } from './api.js';

export function createEmployee(data) {
    return apiRequest('/empleados', { method: 'POST', data });
}

export function loginEmployee(dni, codigo) {
    return apiRequest('/empleados/login', { method: 'POST', data: { dni, codigo } });
}

export function getCurrentEmployee() {
    return apiRequest('/empleados/me');
}

export function logoutEmployee() {
    return apiRequest('/empleados/logout', { method: 'POST' });
}
