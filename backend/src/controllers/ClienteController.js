import { sendSuccess } from '../responses/ApiResponse.js';

export default class ClienteController {
    constructor(service) {
        this.service = service;
    }

    getByDni = (request, response) => {
        return sendSuccess(response, this.service.getByDni(request.params.dni));
    };

    create = (request, response) => {
        return sendSuccess(response, this.service.create(request.body), 201);
    };
}
