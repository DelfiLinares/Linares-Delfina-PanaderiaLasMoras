export default class ClienteRepository {
    constructor() {
        this.clientes = [];
    }

    findByDni(dni) {
        const cliente = this.clientes.find((item) => item.dni === dni);
        return cliente ? { ...cliente } : undefined;
    }

    create(cliente) {
        this.clientes.push({ ...cliente });
        return { ...cliente };
    }
}
