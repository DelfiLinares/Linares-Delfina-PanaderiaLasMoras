import { Messages } from '../enums/Messages.js';
import { ConflictError } from '../exceptions/AppError.js';

export function assertStock(producto, cantidad) {
    if (cantidad > producto.stock) {
        throw new ConflictError(`${Messages.INSUFFICIENT_STOCK}: ${producto.nombre} (disponibles: ${producto.stock}).`);
    }
}
