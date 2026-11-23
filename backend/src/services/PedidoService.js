import Pedido from '../models/Pedido.js';
import { EstadoPedido } from '../enums/EstadoPedido.js';
import { Messages } from '../enums/Messages.js';
import { BadRequestError, ConflictError, NotFoundError } from '../exceptions/AppError.js';
import { assertStock } from '../utils/assertStock.js';
import { validateDniBody } from '../utils/validateCarrito.js';

export default class PedidoService {
    constructor(repository, carritoService, clienteService, productoRepository) {
        this.repository = repository;
        this.carritoService = carritoService;
        this.clienteService = clienteService;
        this.productoRepository = productoRepository;
    }

    listByCliente(dni) {
        const cliente = this.clienteService.getByDni(dni);
        return this.repository.findByCliente(cliente.dni).reverse();
    }

    confirm(data) {
        const cliente = this.clienteService.getByDni(validateDniBody(data));
        const carrito = this.carritoService.get(cliente.dni);
        if (carrito.items.length === 0) {
            throw new ConflictError(Messages.EMPTY_CART);
        }
        // Se valida todo el carrito antes de descontar para no confirmar compras a medias.
        carrito.items.forEach((item) => assertStock(item, item.cantidad));

        const pedido = new Pedido(this.repository.nextNumero(), new Date().toISOString(), { dni: cliente.dni, nombre: cliente.nombre });
        for (const item of carrito.items) {
            const producto = this.productoRepository.findById(item.codigo);
            this.productoRepository.update(item.codigo, { ...producto, stock: producto.stock - item.cantidad });
            pedido.agregarProducto(producto, item.cantidad);
        }
        this.carritoService.clear(cliente.dni);
        return this.repository.create(pedido);
    }

    cancel(numero, data) {
        const cliente = this.clienteService.getByDni(validateDniBody(data));
        if (!/^\d+$/.test(numero)) {
            throw new BadRequestError(Messages.INVALID_ORDER_NUMBER);
        }
        const pedido = this.repository.findByNumero(Number(numero));
        if (!pedido || pedido.cliente.dni !== cliente.dni) {
            throw new NotFoundError(Messages.ORDER_NOT_FOUND);
        }
        if (pedido.estado === EstadoPedido.CANCELADO) {
            throw new ConflictError(Messages.ORDER_ALREADY_CANCELLED);
        }
        for (const { producto, cantidad } of pedido.detalles) {
            const actual = this.productoRepository.findById(producto.codigo);
            if (actual) {
                this.productoRepository.update(actual.codigo, { ...actual, stock: actual.stock + cantidad });
            }
        }
        pedido.estado = EstadoPedido.CANCELADO;
        return this.repository.update(pedido);
    }
}
