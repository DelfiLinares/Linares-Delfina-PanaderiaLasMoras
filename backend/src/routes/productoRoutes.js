import { Router } from 'express';

export function createProductoRoutes(controller) {
    const router = Router();
    router.get('/', controller.getAll);
    router.get('/:codigo', controller.getById);
    router.post('/', controller.create);
    router.put('/:codigo', controller.update);
    router.delete('/:codigo', controller.delete);
    return router;
}