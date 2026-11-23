import { NotFoundError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';

export function notFoundHandler(request, response, next) {
    next(new NotFoundError(Messages.ROUTE_NOT_FOUND));
}