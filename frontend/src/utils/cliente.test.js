import test from 'node:test';
import assert from 'node:assert/strict';
import { validateClient, validateEmployee } from './cliente.js';
import { addCartItem, cancelOrder, getOrders, removeCartItem } from '../services/tiendaService.js';
import { loginEmployee } from '../services/empleadoService.js';
import { setAuthToken } from '../services/api.js';

test('validateEmployee exige DNI, nombre, cargo y código de empleado', () => {
    assert.deepEqual(validateEmployee({ dni: '20999888', nombre: 'Marta López', cargo: 'Panadera', codigo: 'x' }), {});
    assert.deepEqual(Object.keys(validateEmployee({ dni: '1', nombre: '', cargo: 'P4n', codigo: ' ' })), ['dni', 'nombre', 'cargo', 'codigo']);
});

test('el token de empleado se envía solo mientras hay sesión', async (context) => {
    const fetchMock = context.mock.method(globalThis, 'fetch', async () => new Response(
        JSON.stringify({ success: true, data: {} }), { status: 200 }
    ));
    context.after(() => setAuthToken(null));
    await getOrders('40123456');
    assert.equal(fetchMock.mock.calls[0].arguments[1].headers.Authorization, undefined);
    setAuthToken('abc-123');
    await loginEmployee('20999888', 'codigo');
    assert.equal(fetchMock.mock.calls[1].arguments[0], '/api/empleados/login');
    assert.equal(fetchMock.mock.calls[1].arguments[1].headers.Authorization, 'Bearer abc-123');
    setAuthToken(null);
    await getOrders('40123456');
    assert.equal(fetchMock.mock.calls[2].arguments[1].headers.Authorization, undefined);
});

test('validateClient exige DNI, nombre y teléfono válidos', () => {
    assert.deepEqual(validateClient({ dni: '40123456', nombre: 'Ana', telefono: '381 555-1234' }), {});
    assert.deepEqual(Object.keys(validateClient({ dni: '12.345', nombre: ' ', telefono: 'abc' })), ['dni', 'nombre', 'telefono']);
    assert.ok(validateClient({ dni: '40123456', nombre: 'Ana 123', telefono: '3815551234' }).nombre);
    assert.deepEqual(validateClient({ dni: '40123456', nombre: "María D'Angelo-Pérez", telefono: '3815551234' }), {});
});

test('servicios de tienda arman rutas y cuerpos esperados por la API', async (context) => {
    const fetchMock = context.mock.method(globalThis, 'fetch', async () => new Response(
        JSON.stringify({ success: true, data: {} }), { status: 200 }
    ));
    await addCartItem('40123456', 'PAN/01', 2);
    assert.equal(fetchMock.mock.calls[0].arguments[0], '/api/carritos/40123456/items');
    assert.equal(fetchMock.mock.calls[0].arguments[1].body, '{"codigo":"PAN/01","cantidad":2}');
    await removeCartItem('40123456', 'PAN/01');
    assert.equal(fetchMock.mock.calls[1].arguments[0], '/api/carritos/40123456/items/PAN%2F01');
    await getOrders('40123456');
    assert.equal(fetchMock.mock.calls[2].arguments[0], '/api/pedidos?dni=40123456');
    await cancelOrder(3, '40123456');
    assert.equal(fetchMock.mock.calls[3].arguments[0], '/api/pedidos/3/cancelar');
    assert.equal(fetchMock.mock.calls[3].arguments[1].body, '{"dni":"40123456"}');
});
