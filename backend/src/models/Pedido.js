import DetalleVenta from './DetalleVenta.js';
import { EstadoPedido } from '../enums/EstadoPedido.js';

const redondear = (valor) => Math.round(valor * 100) / 100;

class Pedido {
    constructor(numero, fecha, cliente, empleado = null) {
        this.numero = numero;
        this.fecha = fecha;
        this.total = 0;
        this.cliente = cliente;
        this.empleado = empleado;
        this.estado = EstadoPedido.CONFIRMADO;
        this.detalles = [];
    }

    agregarProducto(producto, cantidad) {
        const { codigo, nombre, precio } = producto;
        this.detalles.push(new DetalleVenta({ codigo, nombre, precio }, cantidad, redondear(precio * cantidad)));
        this.total = this.calcularTotal();
    }

    calcularTotal() {
        return redondear(this.detalles.reduce((total, detalle) => total + detalle.subtotal, 0));
    }
}

export default Pedido;