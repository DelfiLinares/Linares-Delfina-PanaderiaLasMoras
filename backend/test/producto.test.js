import test from 'node:test';
import assert from 'node:assert/strict';
import ProductoRepository from '../src/repositories/ProductoRepository.js';
import ProductoService from '../src/services/ProductoService.js';
import { Messages } from '../src/enums/Messages.js';
import { createApp } from '../src/app.js';
import { once } from 'node:events';
import Pan from '../Pan.js';
import Producto from '../Producto.js';
import { CODIGO_TEST, iniciarSesionEmpleado } from './helpers/auth.js';

const producto = { codigo: 'PAN-01', nombre: 'Pan integral', precio: 1500, stock: 20 };

test('CRUD en memoria y copias independientes', () => {
    const service = new ProductoService(new ProductoRepository());
    assert.deepEqual(service.getAll(), []);
    assert.deepEqual(service.create(producto), producto);
    assert.deepEqual(service.getById(producto.codigo), producto);
    const listado = service.getAll();
    listado[0].stock = 999;
    assert.equal(service.getById(producto.codigo).stock, 20);
    assert.equal(service.update(producto.codigo, { ...producto, stock: 10 }).stock, 10);
    assert.equal(service.delete(producto.codigo).stock, 10);
    assert.deepEqual(service.getAll(), []);
    assert.throws(() => service.getById(producto.codigo), { statusCode: 404, message: Messages.PRODUCT_NOT_FOUND });
});

test('rechaza duplicados, datos invalidos y cambios de identificador sin mutar registros', () => {
    const service = new ProductoService(new ProductoRepository());
    service.create(producto);
    assert.throws(() => service.create(producto), { statusCode: 409 });
    for (const data of [null, [], {}, { ...producto, stock: -1 }, { ...producto, stock: 1.5 },
        { ...producto, precio: '1500' }, { ...producto, precio: Infinity },
        { ...producto, nombre: ' ' }, { ...producto, codigo: ' ' }, { ...producto, extra: true }]) {
        assert.throws(() => service.create(data), { statusCode: 400 });
    }
    assert.throws(() => service.update(producto.codigo, { ...producto, codigo: 'OTRO' }), { statusCode: 400 });
    assert.deepEqual(service.getAll(), [producto]);
    assert.throws(() => service.update('INEXISTENTE', producto), { statusCode: 404 });
    assert.throws(() => service.delete('INEXISTENTE'), { statusCode: 404 });
});

test('los imports originales conservan la herencia del dominio', () => {
    const pan = new Pan('PAN-01', 'Pan integral', 1500, 20, 'Integral', 0.5);
    assert.ok(pan instanceof Producto);
    assert.equal(pan.tipoMasa, 'Integral');
});

async function startApi(context, options) {
    const server = createApp({ codigoEmpleado: CODIGO_TEST, ...options }).listen(0, '127.0.0.1');
    context.after(() => new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
        server.closeAllConnections();
    }));
    await once(server, 'listening');
    return `http://127.0.0.1:${server.address().port}`;
}

test('CRUD HTTP con formato uniforme y codigos de estado', async (context) => {
    const baseUrl = await startApi(context);
    const token = await iniciarSesionEmpleado(baseUrl);
    const request = async (path, method = 'GET', body) => {
        const response = await fetch(`${baseUrl}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173', Authorization: `Bearer ${token}` },
            body: body === undefined ? undefined : JSON.stringify(body)
        });
        assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
        return { status: response.status, body: await response.json() };
    };

    assert.deepEqual(await request('/products'), { status: 200, body: { success: true, data: [] } });
    assert.deepEqual(await request('/products', 'POST', producto), {
        status: 201, body: { success: true, data: producto }
    });
    assert.deepEqual(await request('/products/PAN-01'), {
        status: 200, body: { success: true, data: producto }
    });
    assert.deepEqual(await request('/products'), {
        status: 200, body: { success: true, data: [producto] }
    });
    assert.deepEqual(await request('/products', 'POST', producto), {
        status: 409, body: { success: false, message: Messages.DUPLICATED_RESOURCE }
    });
    assert.deepEqual(await request('/products', 'POST', { ...producto, stock: -1 }), {
        status: 400, body: { success: false, message: Messages.INVALID_DATA }
    });
    assert.deepEqual(await request('/products/PAN-01', 'PUT', { ...producto, stock: 4 }), {
        status: 200, body: { success: true, data: { ...producto, stock: 4 } }
    });
    assert.deepEqual(await request('/products/PAN-01', 'DELETE'), {
        status: 200, body: { success: true, data: { ...producto, stock: 4 } }
    });
    for (const method of ['GET', 'PUT', 'DELETE']) {
        assert.deepEqual(await request('/products/PAN-01', method, method === 'PUT' ? producto : undefined), {
            status: 404, body: { success: false, message: Messages.PRODUCT_NOT_FOUND }
        });
    }
    assert.deepEqual(await request('/ruta-inexistente'), {
        status: 404, body: { success: false, message: Messages.ROUTE_NOT_FOUND }
    });
    assert.deepEqual(await request('/products'), { status: 200, body: { success: true, data: [] } });
});

test('errores del parser JSON se centralizan sin exponer detalles internos', async (context) => {
    const baseUrl = await startApi(context);
    for (const [body, status, message] of [
        ['{"codigo":', 400, Messages.INVALID_JSON],
        [JSON.stringify({ nombre: 'a'.repeat(110000) }), 413, Messages.PAYLOAD_TOO_LARGE]
    ]) {
        const response = await fetch(`${baseUrl}/products`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body
        });
        assert.equal(response.status, status);
        assert.deepEqual(await response.json(), { success: false, message });
    }
    const response = await fetch(`${baseUrl}/products/%E0%A4%A`);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { success: false, message: Messages.INVALID_DATA });
});

test('errores inesperados devuelven 500 con un mensaje generico', async (context) => {
    context.mock.method(console, 'error', () => {});
    const baseUrl = await startApi(context, {
        repository: { findAll() { throw new Error('detalle privado'); } }
    });
    const response = await fetch(`${baseUrl}/products`);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { success: false, message: Messages.INTERNAL_ERROR });
    assert.equal(console.error.mock.callCount(), 1);
});