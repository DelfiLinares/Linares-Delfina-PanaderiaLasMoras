import { Router } from 'express';

export function createEmpleadoRoutes(controller, requireEmpleado) {
    const router = Router();
    router.post('/', controller.create);
    router.post('/login', controller.login);
    router.get('/me', requireEmpleado, controller.me);
    router.post('/logout', requireEmpleado, controller.logout);
    return router;
}
