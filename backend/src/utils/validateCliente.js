import { Messages } from '../enums/Messages.js';
import { BadRequestError } from '../exceptions/AppError.js';

export function validateDni(dni) {
    if (typeof dni !== 'string' || !/^\d{7,8}$/.test(dni.trim())) {
        throw new BadRequestError(Messages.INVALID_DNI);
    }
    return dni.trim();
}

export function validateCliente(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)
        || Object.keys(data).some((field) => !['dni', 'nombre', 'telefono'].includes(field))) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    const dni = validateDni(data.dni);
    if (typeof data.nombre !== 'string' || !data.nombre.trim() || data.nombre.trim().length > 120
        || !/^[\p{L}][\p{L}\s.'-]*$/u.test(data.nombre.trim())) {
        throw new BadRequestError(Messages.INVALID_NAME);
    }
    if (typeof data.telefono !== 'string' || !/^[\d\s+()-]{6,20}$/.test(data.telefono.trim())) {
        throw new BadRequestError(Messages.INVALID_PHONE);
    }
    return { dni, nombre: data.nombre.trim(), telefono: data.telefono.trim() };
}
