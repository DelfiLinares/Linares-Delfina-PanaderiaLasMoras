export default class ProductoRepository {
    constructor() {
        this.productos = [];
    }

    findAll() {
        return this.productos.map((producto) => ({ ...producto }));
    }

    findById(codigo) {
        const producto = this.productos.find((item) => item.codigo === codigo);
        return producto ? { ...producto } : undefined;
    }

    create(producto) {
        this.productos.push({ ...producto });
        return { ...producto };
    }

    update(codigo, producto) {
        const index = this.productos.findIndex((item) => item.codigo === codigo);
        if (index === -1) {
            return undefined;
        }
        this.productos[index] = { ...producto };
        return { ...producto };
    }

    delete(codigo) {
        const index = this.productos.findIndex((item) => item.codigo === codigo);
        if (index === -1) {
            return undefined;
        }
        const [producto] = this.productos.splice(index, 1);
        return { ...producto };
    }
}