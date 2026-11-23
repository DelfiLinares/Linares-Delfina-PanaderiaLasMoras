import { Messages } from '../enums/Messages.js';
import { BadRequestError } from '../exceptions/AppError.js';

export function validateCodigo(codigo) {
    if (typeof codigo !== 'string' || !codigo.trim() || codigo.trim().length > 50) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    return codigo.trim();
}

export function validateProducto(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    const allowedFields = ['codigo', 'nombre', 'precio', 'stock'];
    if (Object.keys(data).some((field) => !allowedFields.includes(field))) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    const codigo = validateCodigo(data.codigo);
    if (typeof data.nombre !== 'string' || !data.nombre.trim() || data.nombre.trim().length > 120
        || typeof data.precio !== 'number' || !Number.isFinite(data.precio) || data.precio < 0
        || !Number.isSafeInteger(data.stock) || data.stock < 0) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    return { codigo, nombre: data.nombre.trim(), precio: data.precio, stock: data.stock };
}