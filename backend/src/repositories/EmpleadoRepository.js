export default class EmpleadoRepository {
    constructor() {
        this.empleados = [];
    }

    findByDni(dni) {
        const empleado = this.empleados.find((item) => item.dni === dni);
        return empleado ? { ...empleado } : undefined;
    }

    create(empleado) {
        this.empleados.push({ ...empleado });
        return { ...empleado };
    }
}
