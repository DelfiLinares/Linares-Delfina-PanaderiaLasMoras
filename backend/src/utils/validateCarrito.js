import { Messages } from '../enums/Messages.js';
import { BadRequestError } from '../exceptions/AppError.js';

function assertBody(data, allowedFields) {
    if (!data || typeof data !== 'object' || Array.isArray(data)
        || Object.keys(data).some((field) => !allowedFields.includes(field))) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
}

export function validateCantidad(cantidad) {
    if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
        throw new BadRequestError(Messages.INVALID_QUANTITY);
    }
    return cantidad;
}

export function validateItem(data) {
    assertBody(data, ['codigo', 'cantidad']);
    return { codigo: data.codigo, cantidad: validateCantidad(data.cantidad) };
}

export function validateCambioCantidad(data) {
    assertBody(data, ['cantidad']);
    return validateCantidad(data.cantidad);
}

export function validateDniBody(data) {
    assertBody(data, ['dni']);
    return data.dni;
}
