export function requireEmpleado(empleadoService) {
    return (request, response, next) => {
        try {
            request.empleado = empleadoService.authenticate(request.headers.authorization);
            next();
        } catch (error) {
            next(error);
        }
    };
}
