const API_URL = (import.meta.env?.VITE_API_URL || '/api').replace(/\/$/, '');

let authToken = null;

export function setAuthToken(token) {
    authToken = token;
}

export async function apiRequest(path, { method = 'GET', data, signal } = {}) {
    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            signal,
            headers: {
                Accept: 'application/json',
                ...(data !== undefined && { 'Content-Type': 'application/json' }),
                ...(authToken && { Authorization: `Bearer ${authToken}` })
            },
            body: data === undefined ? undefined : JSON.stringify(data)
        });
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error;
        }
        throw new Error('No se pudo conectar con la API. Verificá que el backend esté iniciado.');
    }

    let result;
    try {
        result = await response.json();
    } catch {
        throw new Error('La API devolvió una respuesta inválida.');
    }
    if (!response.ok || result?.success !== true) {
        throw new Error(result?.message || 'No se pudo completar la operación.');
    }
    if (!Object.hasOwn(result, 'data')) {
        throw new Error('La API devolvió una respuesta incompleta.');
    }
    return result.data;
}