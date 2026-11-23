import { Router } from 'express';

export function createProductoRoutes(controller, requireEmpleado) {
    const router = Router();
    router.get('/', controller.getAll);
    router.get('/:codigo', controller.getById);
    router.post('/', requireEmpleado, controller.create);
    router.put('/:codigo', requireEmpleado, controller.update);
    router.delete('/:codigo', requireEmpleado, controller.delete);
    return router;
}