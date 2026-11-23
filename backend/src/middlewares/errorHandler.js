

import AppError from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { sendError } from '../responses/ApiResponse.js';

export function errorHandler(error, request, response, next) {
    if (response.headersSent) {
        return next(error);
    }
    if (error instanceof AppError) {
        return sendError(response, error.message, error.statusCode);
    }
    if (error.type === 'entity.parse.failed') {
        return sendError(response, Messages.INVALID_JSON, 400);
    }
    if (error.type === 'entity.too.large') {
        return sendError(response, Messages.PAYLOAD_TOO_LARGE, 413);
    }
    if (error instanceof URIError || error.type === 'request.aborted'
        || error.type === 'request.size.invalid') {
        return sendError(response, Messages.INVALID_DATA, 400);
    }
    if (error.type === 'charset.unsupported' || error.type === 'encoding.unsupported') {
        return sendError(response, Messages.INVALID_DATA, 415);
    }
    console.error(error);
    return sendError(response, Messages.INTERNAL_ERROR, 500);
}