import { Router } from 'express';

export function createCarritoRoutes(controller) {
    const router = Router();
    router.get('/:dni', controller.get);
    router.delete('/:dni', controller.clear);
    router.post('/:dni/items', controller.addItem);
    router.put('/:dni/items/:codigo', controller.updateItem);
    router.delete('/:dni/items/:codigo', controller.removeItem);
    return router;
}
