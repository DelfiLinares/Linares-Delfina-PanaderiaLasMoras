export default class SesionRepository {
    constructor() {
        this.sesiones = new Map();
    }

    findDni(token) {
        return this.sesiones.get(token);
    }

    create(token, dni) {
        this.sesiones.set(token, dni);
    }

    delete(token) {
        this.sesiones.delete(token);
    }
}
