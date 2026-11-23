

import { randomUUID } from 'node:crypto';
import Empleado from '../models/Empleado.js';
import { Messages } from '../enums/Messages.js';
import { ConflictError, ForbiddenError, UnauthorizedError } from '../exceptions/AppError.js';
import { validateEmpleado, validateLogin } from '../utils/validateEmpleado.js';

export default class EmpleadoService {
    constructor(repository, clienteRepository, sesionRepository, codigoEmpleado) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
        this.sesionRepository = sesionRepository;
        this.codigoEmpleado = codigoEmpleado;
    }

    create(data) {
        const empleado = validateEmpleado(data);
        if (empleado.codigo !== this.codigoEmpleado) {
            throw new ForbiddenError(Messages.WRONG_ACCESS_CODE);
        }
        if (this.repository.findByDni(empleado.dni)) {
            throw new ConflictError(Messages.DUPLICATED_EMPLOYEE);
        }
        if (this.clienteRepository.findByDni(empleado.dni)) {
            throw new ConflictError(Messages.DNI_USED_BY_CLIENT);
        }
        return this.repository.create(new Empleado(empleado.dni, empleado.nombre, empleado.cargo));
    }

    login(data) {
        const { dni, codigo } = validateLogin(data);
        const empleado = this.repository.findByDni(dni);
        if (!empleado || codigo !== this.codigoEmpleado) {
            throw new UnauthorizedError(Messages.INVALID_CREDENTIALS);
        }
        const token = randomUUID();
        this.sesionRepository.create(token, empleado.dni);
        return { empleado, token };
    }

    authenticate(authorization) {
        const dni = this.sesionRepository.findDni(this.#token(authorization));
        const empleado = dni && this.repository.findByDni(dni);
        if (!empleado) {
            throw new UnauthorizedError(Messages.UNAUTHORIZED);
        }
        return empleado;
    }

    logout(authorization) {
        this.authenticate(authorization);
        this.sesionRepository.delete(this.#token(authorization));
        return { sesionCerrada: true };
    }

    #token(authorization) {
        return /^Bearer (\S+)$/.exec(authorization ?? '')?.[1];
    }
}
