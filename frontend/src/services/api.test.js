import test from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest } from './api.js';
import { getProduct, createProduct, updateProduct, deleteProduct } from './productService.js';

test('servicios serializan cuerpos y codifican los identificadores', async (context) => {
    const fetchMock = context.mock.method(globalThis, 'fetch', async () => new Response(
        JSON.stringify({ success: true, data: { codigo: 'PAN/01' } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
    await getProduct('PAN/01');
    assert.equal(fetchMock.mock.calls[0].arguments[0], '/api/products/PAN%2F01');
    await createProduct({ codigo: 'PAN/01' });
    assert.equal(fetchMock.mock.calls[1].arguments[1].method, 'POST');
    assert.equal(fetchMock.mock.calls[1].arguments[1].body, '{"codigo":"PAN/01"}');
    await updateProduct('PAN/01', { stock: 2 });
    assert.equal(fetchMock.mock.calls[2].arguments[1].method, 'PUT');
    await deleteProduct('PAN/01');
    assert.equal(fetchMock.mock.calls[3].arguments[1].method, 'DELETE');
});

test('servicios propagan errores HTTP, respuestas invalidas y fallos de conexion', async (context) => {
    context.mock.method(globalThis, 'fetch', async () => new Response(
        JSON.stringify({ success: false, message: 'El producto no existe.' }), { status: 404 }
    ));
    await assert.rejects(apiRequest('/products/inexistente'), /El producto no existe/);
    globalThis.fetch = async () => new Response('no es JSON');
    await assert.rejects(apiRequest('/products'), /respuesta inválida/);
    globalThis.fetch = async () => { throw new TypeError('network'); };
    await assert.rejects(apiRequest('/products'), /No se pudo conectar/);
    globalThis.fetch = async () => { throw new DOMException('cancelado', 'AbortError'); };
    await assert.rejects(apiRequest('/products'), { name: 'AbortError' });
});