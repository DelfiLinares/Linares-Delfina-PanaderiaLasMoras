import { once } from 'node:events';
import { createApp } from '../../src/app.js';
import { CODIGO_TEST, EMPLEADO_TEST, iniciarSesionEmpleado } from './auth.js';

// Devuelve una funcion que opera como empleado (necesario para administrar productos).
// request.sinSesion envia las mismas peticiones sin credenciales y request.como(token)
// permite usar otra sesion.
export async function startApi(context) {
    const server = createApp({ codigoEmpleado: CODIGO_TEST }).listen(0, '127.0.0.1');
    context.after(() => new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
        server.closeAllConnections();
    }));
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const token = await iniciarSesionEmpleado(baseUrl);
    const send = async (path, method = 'GET', body, authorization) => {
        const response = await fetch(`${baseUrl}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json', ...(authorization && { Authorization: authorization }) },
            body: body === undefined ? undefined : JSON.stringify(body)
        });
        return { status: response.status, body: await response.json() };
    };
    const request = (path, method, body) => send(path, method, body, `Bearer ${token}`);
    request.sinSesion = (path, method, body) => send(path, method, body);
    request.baseUrl = baseUrl;
    request.token = token;
    request.empleado = EMPLEADO_TEST;
    request.send = send;
    return request;
}
