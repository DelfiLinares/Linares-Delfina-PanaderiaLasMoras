import { Messages } from '../enums/Messages.js';
import { BadRequestError } from '../exceptions/AppError.js';
import { validateDni } from './validateCliente.js';

const NOMBRE = /^[\p{L}][\p{L}\s.'-]*$/u;

function assertBody(data, allowedFields) {
    if (!data || typeof data !== 'object' || Array.isArray(data)
        || Object.keys(data).some((field) => !allowedFields.includes(field))) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
}

function validateCodigoAcceso(codigo) {
    if (typeof codigo !== 'string' || !codigo.trim() || codigo.length > 100) {
        throw new BadRequestError(Messages.INVALID_ACCESS_CODE);
    }
    return codigo;
}

export function validateEmpleado(data) {
    assertBody(data, ['dni', 'nombre', 'cargo', 'codigo']);
    const dni = validateDni(data.dni);
    if (typeof data.nombre !== 'string' || !NOMBRE.test(data.nombre.trim()) || data.nombre.trim().length > 120) {
        throw new BadRequestError(Messages.INVALID_NAME);
    }
    if (typeof data.cargo !== 'string' || !NOMBRE.test(data.cargo.trim()) || data.cargo.trim().length > 60) {
        throw new BadRequestError(Messages.INVALID_JOB);
    }
    return { dni, nombre: data.nombre.trim(), cargo: data.cargo.trim(), codigo: validateCodigoAcceso(data.codigo) };
}

export function validateLogin(data) {
    assertBody(data, ['dni', 'codigo']);
    return { dni: validateDni(data.dni), codigo: validateCodigoAcceso(data.codigo) };
}
