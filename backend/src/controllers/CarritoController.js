import { sendSuccess } from '../responses/ApiResponse.js';

export default class CarritoController {
    constructor(service) {
        this.service = service;
    }

    get = (request, response) => {
        return sendSuccess(response, this.service.get(request.params.dni));
    };

    addItem = (request, response) => {
        return sendSuccess(response, this.service.addItem(request.params.dni, request.body), 201);
    };

    updateItem = (request, response) => {
        return sendSuccess(response, this.service.updateItem(request.params.dni, request.params.codigo, request.body));
    };

    removeItem = (request, response) => {
        return sendSuccess(response, this.service.removeItem(request.params.dni, request.params.codigo));
    };

    clear = (request, response) => {
        return sendSuccess(response, this.service.clear(request.params.dni));
    };
}
