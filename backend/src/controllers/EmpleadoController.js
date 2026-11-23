import { sendSuccess } from '../responses/ApiResponse.js';

export default class EmpleadoController {
    constructor(service) {
        this.service = service;
    }

    create = (request, response) => {
        return sendSuccess(response, this.service.create(request.body), 201);
    };

    login = (request, response) => {
        return sendSuccess(response, this.service.login(request.body));
    };

    me = (request, response) => {
        return sendSuccess(response, request.empleado);
    };

    logout = (request, response) => {
        return sendSuccess(response, this.service.logout(request.headers.authorization));
    };
}
