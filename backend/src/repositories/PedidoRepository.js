export default class PedidoRepository {
    constructor() {
        this.pedidos = [];
        this.ultimoNumero = 0;
    }

    nextNumero() {
        return ++this.ultimoNumero;
    }

    findByCliente(dni) {
        return this.pedidos.filter((pedido) => pedido.cliente.dni === dni).map((pedido) => structuredClone(pedido));
    }

    findByNumero(numero) {
        const pedido = this.pedidos.find((item) => item.numero === numero);
        return pedido ? structuredClone(pedido) : undefined;
    }

    create(pedido) {
        this.pedidos.push(structuredClone(pedido));
        return structuredClone(pedido);
    }

    update(pedido) {
        const index = this.pedidos.findIndex((item) => item.numero === pedido.numero);
        if (index === -1) {
            return undefined;
        }
        this.pedidos[index] = structuredClone(pedido);
        return structuredClone(pedido);
    }
}
