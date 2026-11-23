import test from 'node:test';
import assert from 'node:assert/strict';
import { Messages } from '../src/enums/Messages.js';
import { startApi } from './helpers/api.js';
import { CODIGO_TEST, EMPLEADO_TEST } from './helpers/auth.js';

const cliente = { dni: '40123456', nombre: 'Ana Perez', telefono: '3815551234' };
const producto = { codigo: 'PAN-01', nombre: 'Pan integral', precio: 1500, stock: 5 };

test('solo un empleado con sesion puede crear, editar y eliminar productos', async (context) => {
    const request = await startApi(context);
    await request('/clientes', 'POST', cliente);
    const noAutorizado = { status: 401, body: { success: false, message: Messages.UNAUTHORIZED } };

    // Sin sesion, con un token inventado o con un DNI de cliente como credencial
    for (const authorization of [undefined, 'Bearer inventado', 'Bearer', cliente.dni, `Bearer ${cliente.dni}`]) {
        assert.deepEqual(await request.send('/products', 'POST', producto, authorization), noAutorizado);
    }
    assert.deepEqual(await request.sinSesion('/products', 'POST', producto), noAutorizado);
    assert.equal((await request('/products', 'POST', producto)).status, 201);
    assert.deepEqual(await request.sinSesion('/products/PAN-01', 'PUT', { ...producto, stock: 1 }), noAutorizado);
    assert.deepEqual(await request.sinSesion('/products/PAN-01', 'DELETE'), noAutorizado);
    assert.equal((await request('/products/PAN-01')).body.data.stock, 5);

    // Consultar el menu es publico
    assert.equal((await request.sinSesion('/products')).status, 200);
    assert.equal((await request.sinSesion('/products/PAN-01')).status, 200);
});

test('un empleado no puede comprar ni usar el carrito', async (context) => {
    const request = await startApi(context);
    await request('/products', 'POST', producto);
    const { dni } = EMPLEADO_TEST;
    const prohibido = { status: 403, body: { success: false, message: Messages.EMPLOYEE_CANNOT_BUY } };

    assert.deepEqual(await request.sinSesion(`/clientes/${dni}`), prohibido);
    assert.deepEqual(await request.sinSesion(`/carritos/${dni}`), prohibido);
    assert.deepEqual(await request.sinSesion(`/carritos/${dni}/items`, 'POST', { codigo: 'PAN-01', cantidad: 1 }), prohibido);
    assert.deepEqual(await request.sinSesion('/pedidos', 'POST', { dni }), prohibido);
    assert.deepEqual(await request.sinSesion(`/pedidos?dni=${dni}`), prohibido);
    assert.deepEqual(await request.sinSesion('/pedidos/1/cancelar', 'POST', { dni }), prohibido);
    assert.equal((await request('/products/PAN-01')).body.data.stock, 5);
});

test('un mismo DNI no puede ser cliente y empleado', async (context) => {
    const request = await startApi(context);
    assert.deepEqual(await request.sinSesion('/clientes', 'POST', { ...cliente, dni: EMPLEADO_TEST.dni }), {
        status: 409, body: { success: false, message: Messages.DNI_USED_BY_EMPLOYEE }
    });
    await request.sinSesion('/clientes', 'POST', cliente);
    assert.deepEqual(await request.sinSesion('/empleados', 'POST', { ...EMPLEADO_TEST, dni: cliente.dni }), {
        status: 409, body: { success: false, message: Messages.DNI_USED_BY_CLIENT }
    });
    assert.deepEqual(await request.sinSesion('/empleados', 'POST', EMPLEADO_TEST), {
        status: 409, body: { success: false, message: Messages.DUPLICATED_EMPLOYEE }
    });
});

test('registro e ingreso de empleados validan datos y el codigo de empleado', async (context) => {
    const request = await startApi(context);
    const nuevo = { ...EMPLEADO_TEST, dni: '27111222' };
    const rechazado = async (path, body, status, message) => assert.deepEqual(
        await request.sinSesion(path, 'POST', body), { status, body: { success: false, message } }, JSON.stringify(body));

    await rechazado('/empleados', { ...nuevo, codigo: 'otro' }, 403, Messages.WRONG_ACCESS_CODE);
    await rechazado('/empleados', { ...nuevo, codigo: '' }, 400, Messages.INVALID_ACCESS_CODE);
    await rechazado('/empleados', { ...nuevo, dni: '12' }, 400, Messages.INVALID_DNI);
    await rechazado('/empleados', { ...nuevo, nombre: 'M4rta' }, 400, Messages.INVALID_NAME);
    await rechazado('/empleados', { ...nuevo, cargo: '' }, 400, Messages.INVALID_JOB);
    await rechazado('/empleados', { ...nuevo, salario: 1 }, 400, Messages.INVALID_DATA);

    const creado = await request.sinSesion('/empleados', 'POST', nuevo);
    assert.deepEqual(creado, { status: 201, body: { success: true, data: { dni: nuevo.dni, nombre: nuevo.nombre, cargo: nuevo.cargo } } });
    assert.ok(!JSON.stringify(creado).includes(CODIGO_TEST));

    await rechazado('/empleados/login', { dni: nuevo.dni, codigo: 'otro' }, 401, Messages.INVALID_CREDENTIALS);
    await rechazado('/empleados/login', { dni: '27999999', codigo: CODIGO_TEST }, 401, Messages.INVALID_CREDENTIALS);
    await rechazado('/empleados/login', { dni: nuevo.dni }, 400, Messages.INVALID_ACCESS_CODE);
    const sesion = await request.sinSesion('/empleados/login', 'POST', { dni: nuevo.dni, codigo: CODIGO_TEST });
    assert.equal(sesion.status, 200);
    assert.equal(sesion.body.data.empleado.cargo, nuevo.cargo);
    assert.match(sesion.body.data.token, /^[\w-]{36}$/);
});

test('la sesion de empleado se consulta y se puede cerrar', async (context) => {
    const request = await startApi(context);
    const authorization = `Bearer ${request.token}`;
    const { status, body } = await request.send('/empleados/me', 'GET', undefined, authorization);
    assert.equal(status, 200);
    assert.equal(body.data.dni, EMPLEADO_TEST.dni);
    assert.equal((await request.sinSesion('/empleados/me')).status, 401);

    assert.deepEqual(await request.send('/empleados/logout', 'POST', undefined, authorization), {
        status: 200, body: { success: true, data: { sesionCerrada: true } }
    });
    assert.equal((await request.send('/empleados/me', 'GET', undefined, authorization)).status, 401);
    assert.equal((await request('/products', 'POST', producto)).status, 401);
});

test('los clientes siguen comprando con normalidad', async (context) => {
    const request = await startApi(context);
    await request('/products', 'POST', producto);
    await request.sinSesion('/clientes', 'POST', cliente);
    assert.equal((await request.sinSesion(`/carritos/${cliente.dni}/items`, 'POST', { codigo: 'PAN-01', cantidad: 2 })).status, 201);
    assert.equal((await request.sinSesion('/pedidos', 'POST', { dni: cliente.dni })).status, 201);
    assert.equal((await request.sinSesion('/products/PAN-01')).body.data.stock, 3);
});
