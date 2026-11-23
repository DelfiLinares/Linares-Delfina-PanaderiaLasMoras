import { sendSuccess } from '../responses/ApiResponse.js';

export default class PedidoController {
    constructor(service) {
        this.service = service;
    }

    list = (request, response) => {
        return sendSuccess(response, this.service.listByCliente(request.query.dni));
    };

    confirm = (request, response) => {
        return sendSuccess(response, this.service.confirm(request.body), 201);
    };

    cancel = (request, response) => {
        return sendSuccess(response, this.service.cancel(request.params.numero, request.body));
    };
}
