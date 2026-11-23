import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProduct, toProductPayload, stockStatus } from './product.js';

test('validaciones y conversion respetan el contrato del backend', () => {
    const values = { codigo: ' PAN-01 ', nombre: ' Pan integral ', precio: '1500', stock: '20' };
    assert.deepEqual(validateProduct(values), {});
    assert.deepEqual(toProductPayload(values), { codigo: 'PAN-01', nombre: 'Pan integral', precio: 1500, stock: 20 });
    assert.equal(Object.keys(validateProduct({ codigo: '', nombre: '', precio: '', stock: '' })).length, 4);
    assert.ok(validateProduct({ ...values, stock: '1.5' }).stock);
    assert.ok(validateProduct({ ...values, precio: '-1' }).precio);
    assert.deepEqual(validateProduct({ ...values, stock: '0', precio: '0' }), {});
    assert.equal(stockStatus(0).label, 'Sin stock');
    assert.equal(stockStatus(5).label, 'Stock bajo');
    assert.equal(stockStatus(6).label, 'Disponible');
});