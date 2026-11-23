import Cliente from '../models/Cliente.js';
import { Messages } from '../enums/Messages.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../exceptions/AppError.js';
import { validateCliente, validateDni } from '../utils/validateCliente.js';

export default class ClienteService {
    constructor(repository, empleadoRepository) {
        this.repository = repository;
        this.empleadoRepository = empleadoRepository;
    }

    getByDni(dni) {
        const validDni = validateDni(dni);
        const cliente = this.repository.findByDni(validDni);
        if (cliente) {
            return cliente;
        }
        throw this.empleadoRepository.findByDni(validDni)
            ? new ForbiddenError(Messages.EMPLOYEE_CANNOT_BUY)
            : new NotFoundError(Messages.CLIENT_NOT_FOUND);
    }

    create(data) {
        const cliente = validateCliente(data);
        if (this.repository.findByDni(cliente.dni)) {
            throw new ConflictError(Messages.DUPLICATED_CLIENT);
        }
        if (this.empleadoRepository.findByDni(cliente.dni)) {
            throw new ConflictError(Messages.DNI_USED_BY_EMPLOYEE);
        }
        return this.repository.create(new Cliente(cliente.dni, cliente.nombre, cliente.telefono));
    }
}
