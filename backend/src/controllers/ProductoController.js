import { sendSuccess } from '../responses/ApiResponse.js';

export default class ProductoController {
    constructor(service) {
        this.service = service;
    }

    getAll = (request, response) => {
        return sendSuccess(response, this.service.getAll());
    };

    getById = (request, response) => {
        return sendSuccess(response, this.service.getById(request.params.codigo));
    };

    create = (request, response) => {
        return sendSuccess(response, this.service.create(request.body), 201);
    };

    update = (request, response) => {
        return sendSuccess(response, this.service.update(request.params.codigo, request.body));
    };

    delete = (request, response) => {
        return sendSuccess(response, this.service.delete(request.params.codigo));
    };
}