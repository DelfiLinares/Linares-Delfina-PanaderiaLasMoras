import test from 'node:test';
import assert from 'node:assert/strict';
import { Messages } from '../src/enums/Messages.js';
import { startApi } from './helpers/api.js';

const cliente = { dni: '40123456', nombre: 'Ana Perez', telefono: '3815551234' };

async function prepararTienda(request) {
    await request('/products', 'POST', { codigo: 'PAN-01', nombre: 'Pan integral', precio: 1500, stock: 5 });
    await request('/products', 'POST', { codigo: 'TOR-01', nombre: 'Torta de moras', precio: 14500.5, stock: 1 });
    await request('/clientes', 'POST', cliente);
}

test('rechaza datos faltantes, con formato incorrecto o con campos de mas y explica el motivo', async (context) => {
    const request = await startApi(context);
    await prepararTienda(request);
    const rechazado = async (path, method, body, message) => {
        const result = await request(path, method, body);
        assert.deepEqual(result, { status: 400, body: { success: false, message } }, `${method} ${path} ${JSON.stringify(body)}`);
    };

    await rechazado('/clientes', 'POST', {}, Messages.INVALID_DNI);
    await rechazado('/clientes', 'POST', { ...cliente, dni: 40123457 }, Messages.INVALID_DNI);
    await rechazado('/clientes', 'POST', { ...cliente, dni: '4012345' + '6'.repeat(3) }, Messages.INVALID_DNI);
    await rechazado('/clientes', 'POST', { ...cliente, dni: '30111222', nombre: '' }, Messages.INVALID_NAME);
    await rechazado('/clientes', 'POST', { ...cliente, dni: '30111222', nombre: 'Ana 123' }, Messages.INVALID_NAME);
    await rechazado('/clientes', 'POST', { ...cliente, dni: '30111222', nombre: 'a'.repeat(121) }, Messages.INVALID_NAME);
    await rechazado('/clientes', 'POST', { dni: '30111222', nombre: 'Ana' }, Messages.INVALID_PHONE);
    await rechazado('/clientes', 'POST', { ...cliente, dni: '30111222', telefono: 'abc' }, Messages.INVALID_PHONE);
    await rechazado('/clientes', 'POST', [cliente], Messages.INVALID_DATA);
    await rechazado('/clientes/12', 'GET', undefined, Messages.INVALID_DNI);

    for (const cantidad of [0, -1, 1.5, '2', null, undefined]) {
        await rechazado('/carritos/40123456/items', 'POST', { codigo: 'PAN-01', cantidad }, Messages.INVALID_QUANTITY);
    }
    await rechazado('/carritos/40123456/items', 'POST', { cantidad: 1 }, Messages.INVALID_DATA);
    await rechazado('/carritos/40123456/items', 'POST', { codigo: 'PAN-01', cantidad: 1, precio: 1 }, Messages.INVALID_DATA);
    await rechazado('/carritos/40123456/items/PAN-01', 'PUT', {}, Messages.INVALID_QUANTITY);
    await rechazado('/pedidos', 'POST', {}, Messages.INVALID_DNI);
    await rechazado('/pedidos?dni=abc', 'GET', undefined, Messages.INVALID_DNI);
    await rechazado('/pedidos/abc/cancelar', 'POST', { dni: cliente.dni }, Messages.INVALID_ORDER_NUMBER);

    const sinJson = await fetch(`${request.baseUrl}/clientes`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'dni=1' });
    assert.equal(sinJson.status, 400);
    assert.equal((await request('/carritos/40123456')).body.data.items.length, 0);
});

test('impide operar sobre clientes, productos, items o pedidos inexistentes', async (context) => {
    const request = await startApi(context);
    await prepararTienda(request);
    const noExiste = async (path, method, body, message) => {
        assert.deepEqual(await request(path, method, body), { status: 404, body: { success: false, message } }, `${method} ${path}`);
    };

    await noExiste('/clientes/30111222', 'GET', undefined, Messages.CLIENT_NOT_FOUND);
    await noExiste('/carritos/30111222', 'GET', undefined, Messages.CLIENT_NOT_FOUND);
    await noExiste('/carritos/30111222/items', 'POST', { codigo: 'PAN-01', cantidad: 1 }, Messages.CLIENT_NOT_FOUND);
    await noExiste('/pedidos?dni=30111222', 'GET', undefined, Messages.CLIENT_NOT_FOUND);
    await noExiste('/pedidos', 'POST', { dni: '30111222' }, Messages.CLIENT_NOT_FOUND);
    await noExiste('/carritos/40123456/items', 'POST', { codigo: 'NO-EXISTE', cantidad: 1 }, Messages.PRODUCT_NOT_FOUND);
    await noExiste('/carritos/40123456/items/PAN-01', 'DELETE', undefined, Messages.ITEM_NOT_IN_CART);
    await noExiste('/pedidos/99/cancelar', 'POST', { dni: cliente.dni }, Messages.ORDER_NOT_FOUND);
});

test('un producto eliminado desaparece del carrito y no se puede comprar', async (context) => {
    const request = await startApi(context);
    await prepararTienda(request);
    await request('/carritos/40123456/items', 'POST', { codigo: 'PAN-01', cantidad: 2 });
    await request('/products/PAN-01', 'DELETE');
    assert.deepEqual((await request('/carritos/40123456')).body.data.items, []);
    assert.deepEqual(await request('/pedidos', 'POST', { dni: cliente.dni }), {
        status: 409, body: { success: false, message: Messages.EMPTY_CART }
    });
});

test('cancelar tras eliminar el producto no falla y los precios del pedido no cambian', async (context) => {
    const request = await startApi(context);
    await prepararTienda(request);
    await request('/carritos/40123456/items', 'POST', { codigo: 'PAN-01', cantidad: 2 });
    await request('/pedidos', 'POST', { dni: cliente.dni });
    await request('/products/PAN-01', 'PUT', { codigo: 'PAN-01', nombre: 'Pan integral', precio: 9999, stock: 3 });
    assert.equal((await request('/pedidos?dni=40123456')).body.data[0].total, 3000);
    await request('/products/PAN-01', 'DELETE');
    assert.equal((await request('/pedidos/1/cancelar', 'POST', { dni: cliente.dni })).status, 200);
});

test('registro de clientes valida datos y evita DNI duplicados', async (context) => {
    const request = await startApi(context);
    assert.equal((await request('/clientes', 'POST', cliente)).status, 201);
    assert.deepEqual(await request('/clientes/40123456'), { status: 200, body: { success: true, data: cliente } });
    assert.deepEqual(await request('/clientes', 'POST', cliente), {
        status: 409, body: { success: false, message: Messages.DUPLICATED_CLIENT }
    });
    assert.equal((await request('/clientes', 'POST', { ...cliente, dni: 'abc' })).status, 400);
    assert.equal((await request('/clientes', 'POST', { ...cliente, dni: '1', extra: 1 })).status, 400);
    assert.deepEqual(await request('/clientes/99999999'), {
        status: 404, body: { success: false, message: Messages.CLIENT_NOT_FOUND }
    });
});

test('carrito: agrega, suma cantidades, modifica, quita y respeta el stock', async (context) => {
    const request = await startApi(context);
    await prepararTienda(request);

    let { body } = await request('/carritos/40123456/items', 'POST', { codigo: 'PAN-01', cantidad: 2 });
    assert.equal(body.data.total, 3000);
    ({ body } = await request('/carritos/40123456/items', 'POST', { codigo: 'PAN-01', cantidad: 1 }));
    assert.equal(body.data.items[0].cantidad, 3);
    assert.equal(body.data.unidades, 3);

    const exceso = await request('/carritos/40123456/items', 'POST', { codigo: 'PAN-01', cantidad: 3 });
    assert.equal(exceso.status, 409);
    assert.match(exceso.body.message, /Pan integral \(disponibles: 5\)/);
    assert.equal((await request('/carritos/40123456/items', 'POST', { codigo: 'PAN-01', cantidad: 0 })).status, 400);
    assert.equal((await request('/carritos/40123456/items', 'POST', { codigo: 'NO-EXISTE', cantidad: 1 })).status, 404);

    ({ body } = await request('/carritos/40123456/items/PAN-01', 'PUT', { cantidad: 5 }));
    assert.equal(body.data.total, 7500);
    assert.equal((await request('/carritos/40123456/items/PAN-01', 'PUT', { cantidad: 6 })).status, 409);
    assert.equal((await request('/carritos/40123456/items/TOR-01', 'PUT', { cantidad: 1 })).status, 404);

    ({ body } = await request('/carritos/40123456/items/PAN-01', 'DELETE'));
    assert.deepEqual(body.data.items, []);
    assert.equal((await request('/carritos/40123456/items/PAN-01', 'DELETE')).status, 404);
    assert.equal((await request('/carritos/11111111')).status, 404);
});

test('confirmar compra descuenta stock, vacia el carrito y registra el pedido', async (context) => {
    const request = await startApi(context);
    await prepararTienda(request);
    assert.deepEqual(await request('/pedidos', 'POST', { dni: cliente.dni }), {
        status: 409, body: { success: false, message: Messages.EMPTY_CART }
    });

    await request('/carritos/40123456/items', 'POST', { codigo: 'PAN-01', cantidad: 2 });
    await request('/carritos/40123456/items', 'POST', { codigo: 'TOR-01', cantidad: 1 });
    const { status, body } = await request('/pedidos', 'POST', { dni: cliente.dni });
    assert.equal(status, 201);
    assert.equal(body.data.numero, 1);
    assert.equal(body.data.estado, 'confirmado');
    assert.equal(body.data.total, 17500.5);
    assert.equal(body.data.detalles.length, 2);
    assert.deepEqual(body.data.detalles[0], {
        producto: { codigo: 'PAN-01', nombre: 'Pan integral', precio: 1500 }, cantidad: 2, subtotal: 3000
    });

    assert.equal((await request('/products/PAN-01')).body.data.stock, 3);
    assert.equal((await request('/products/TOR-01')).body.data.stock, 0);
    assert.deepEqual((await request('/carritos/40123456')).body.data.items, []);
    assert.deepEqual((await request('/pedidos?dni=40123456')).body.data, [body.data]);
});

test('si falta stock al confirmar no se modifica nada', async (context) => {
    const request = await startApi(context);
    await prepararTienda(request);
    await request('/carritos/40123456/items', 'POST', { codigo: 'PAN-01', cantidad: 2 });
    await request('/carritos/40123456/items', 'POST', { codigo: 'TOR-01', cantidad: 1 });
    await request('/products/TOR-01', 'PUT', { codigo: 'TOR-01', nombre: 'Torta de moras', precio: 14500.5, stock: 0 });

    const result = await request('/pedidos', 'POST', { dni: cliente.dni });
    assert.equal(result.status, 409);
    assert.equal((await request('/products/PAN-01')).body.data.stock, 5);
    assert.equal((await request('/carritos/40123456')).body.data.items.length, 2);
    assert.deepEqual((await request('/pedidos?dni=40123456')).body.data, []);
});

test('cancelar un pedido devuelve el stock y solo puede hacerlo su cliente', async (context) => {
    const request = await startApi(context);
    await prepararTienda(request);
    await request('/clientes', 'POST', { ...cliente, dni: '30111222' });
    await request('/carritos/40123456/items', 'POST', { codigo: 'PAN-01', cantidad: 4 });
    await request('/pedidos', 'POST', { dni: cliente.dni });
    assert.equal((await request('/products/PAN-01')).body.data.stock, 1);

    assert.deepEqual(await request('/pedidos/1/cancelar', 'POST', { dni: '30111222' }), {
        status: 404, body: { success: false, message: Messages.ORDER_NOT_FOUND }
    });
    const cancelado = await request('/pedidos/1/cancelar', 'POST', { dni: cliente.dni });
    assert.equal(cancelado.status, 200);
    assert.equal(cancelado.body.data.estado, 'cancelado');
    assert.equal((await request('/products/PAN-01')).body.data.stock, 5);
    assert.deepEqual(await request('/pedidos/1/cancelar', 'POST', { dni: cliente.dni }), {
        status: 409, body: { success: false, message: Messages.ORDER_ALREADY_CANCELLED }
    });
    assert.equal((await request('/pedidos/x/cancelar', 'POST', { dni: cliente.dni })).status, 400);
    assert.equal((await request('/pedidos')).status, 400);
});
