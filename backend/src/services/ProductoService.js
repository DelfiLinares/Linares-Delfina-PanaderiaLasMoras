import Producto from '../models/Producto.js';
import { Messages } from '../enums/Messages.js';
import { BadRequestError, ConflictError, NotFoundError } from '../exceptions/AppError.js';
import { validateCodigo, validateProducto } from '../utils/validateProducto.js';

export default class ProductoService {
    constructor(repository) {
        this.repository = repository;
    }

    getAll() {
        return this.repository.findAll();
    }

    getById(codigo) {
        const producto = this.repository.findById(validateCodigo(codigo));
        if (!producto) {
            throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
        }
        return producto;
    }

    create(data) {
        const producto = validateProducto(data);
        if (this.repository.findById(producto.codigo)) {
            throw new ConflictError(Messages.DUPLICATED_RESOURCE);
        }
        return this.repository.create(new Producto(producto.codigo, producto.nombre, producto.precio, producto.stock));
    }

    update(codigo, data) {
        const current = this.getById(codigo);
        const producto = validateProducto(data);
        if (producto.codigo !== current.codigo) {
            throw new BadRequestError(Messages.INVALID_DATA);
        }
        return this.repository.update(current.codigo, producto);
    }

    delete(codigo) {
        const producto = this.getById(codigo);
        return this.repository.delete(producto.codigo);
    }
}