import { Router } from 'express';

export function createClienteRoutes(controller) {
    const router = Router();
    router.post('/', controller.create);
    router.get('/:dni', controller.getByDni);
    return router;
}
