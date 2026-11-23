import { Messages } from '../enums/Messages.js';
import { NotFoundError } from '../exceptions/AppError.js';
import { assertStock } from '../utils/assertStock.js';
import { validateCambioCantidad, validateItem } from '../utils/validateCarrito.js';
import { validateCodigo } from '../utils/validateProducto.js';

export default class CarritoService {
    constructor(repository, clienteService, productoRepository) {
        this.repository = repository;
        this.clienteService = clienteService;
        this.productoRepository = productoRepository;
    }

    get(dni) {
        const { dni: clienteDni } = this.clienteService.getByDni(dni);
        const items = this.repository.findByCliente(clienteDni).flatMap(({ codigo, cantidad }) => {
            const producto = this.productoRepository.findById(codigo);
            if (!producto) {
                return [];
            }
            const subtotal = Math.round(producto.precio * cantidad * 100) / 100;
            return [{ codigo, nombre: producto.nombre, precio: producto.precio, stock: producto.stock, cantidad, subtotal }];
        });
        const total = Math.round(items.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100;
        return { dni: clienteDni, items, total, unidades: items.reduce((sum, item) => sum + item.cantidad, 0) };
    }

    addItem(dni, data) {
        const { dni: clienteDni } = this.clienteService.getByDni(dni);
        const { codigo, cantidad } = validateItem(data);
        const producto = this.#getProducto(codigo);
        const items = this.repository.findByCliente(clienteDni);
        const item = items.find((current) => current.codigo === producto.codigo);
        assertStock(producto, (item?.cantidad ?? 0) + cantidad);
        if (item) {
            item.cantidad += cantidad;
        } else {
            items.push({ codigo: producto.codigo, cantidad });
        }
        this.repository.save(clienteDni, items);
        return this.get(clienteDni);
    }

    updateItem(dni, codigo, data) {
        const { dni: clienteDni } = this.clienteService.getByDni(dni);
        const cantidad = validateCambioCantidad(data);
        const producto = this.#getProducto(codigo);
        const items = this.repository.findByCliente(clienteDni);
        const item = items.find((current) => current.codigo === producto.codigo);
        if (!item) {
            throw new NotFoundError(Messages.ITEM_NOT_IN_CART);
        }
        assertStock(producto, cantidad);
        item.cantidad = cantidad;
        this.repository.save(clienteDni, items);
        return this.get(clienteDni);
    }

    removeItem(dni, codigo) {
        const { dni: clienteDni } = this.clienteService.getByDni(dni);
        const codigoValido = validateCodigo(codigo);
        const items = this.repository.findByCliente(clienteDni);
        if (!items.some((item) => item.codigo === codigoValido)) {
            throw new NotFoundError(Messages.ITEM_NOT_IN_CART);
        }
        this.repository.save(clienteDni, items.filter((item) => item.codigo !== codigoValido));
        return this.get(clienteDni);
    }

    clear(dni) {
        const { dni: clienteDni } = this.clienteService.getByDni(dni);
        this.repository.clear(clienteDni);
        return this.get(clienteDni);
    }

    #getProducto(codigo) {
        const producto = this.productoRepository.findById(validateCodigo(codigo));
        if (!producto) {
            throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
        }
        return producto;
    }
}
