import { Router } from 'express';

export function createPedidoRoutes(controller) {
    const router = Router();
    router.get('/', controller.list);
    router.post('/', controller.confirm);
    router.post('/:numero/cancelar', controller.cancel);
    return router;
}
