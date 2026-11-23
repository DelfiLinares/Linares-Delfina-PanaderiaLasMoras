class Pedido {
    constructor(numero, fecha, total, cliente, empleado) {
        this.numero = numero;
        this.fecha = fecha;
        this.total = total;
        this.cliente = cliente;
        this.empleado = empleado;
        this.detalles = [];
    }
}

export default Pedido;