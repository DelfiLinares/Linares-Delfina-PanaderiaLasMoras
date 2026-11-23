const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;

const isValidDni = (dni) => /^\d{7,8}$/.test(dni.trim());
const isValidName = (name, max = 120) => NAME_PATTERN.test(name.trim()) && name.trim().length <= max;

export function validateClient(values) {
    const errors = {};
    if (!isValidDni(values.dni)) {
        errors.dni = 'Ingresá un DNI de 7 u 8 números, sin puntos.';
    }
    if (!isValidName(values.nombre)) {
        errors.nombre = 'Ingresá tu nombre con letras solamente (hasta 120 caracteres).';
    }
    if (!/^[\d\s+()-]{6,20}$/.test(values.telefono.trim())) {
        errors.telefono = 'Ingresá un teléfono válido, por ejemplo 3815551234.';
    }
    return errors;
}

export function validateEmployee(values) {
    const errors = {};
    if (!isValidDni(values.dni)) {
        errors.dni = 'Ingresá un DNI de 7 u 8 números, sin puntos.';
    }
    if (!isValidName(values.nombre)) {
        errors.nombre = 'Ingresá tu nombre con letras solamente (hasta 120 caracteres).';
    }
    if (!isValidName(values.cargo, 60)) {
        errors.cargo = 'Ingresá tu cargo con letras solamente, por ejemplo Panadero.';
    }
    if (!values.codigo.trim()) {
        errors.codigo = 'Ingresá el código de empleado.';
    }
    return errors;
}

export const formatDate = (value) => new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium', timeStyle: 'short'
}).format(new Date(value));
