export default class CarritoRepository {
    constructor() {
        this.carritos = new Map();
    }

    findByCliente(dni) {
        return (this.carritos.get(dni) ?? []).map((item) => ({ ...item }));
    }

    save(dni, items) {
        this.carritos.set(dni, items.map((item) => ({ ...item })));
    }

    clear(dni) {
        this.carritos.delete(dni);
    }
}
