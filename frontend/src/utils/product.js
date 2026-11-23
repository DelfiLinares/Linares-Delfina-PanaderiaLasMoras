export function validateProduct(values) {
    const errors = {};
    if (!values.codigo.trim() || values.codigo.trim().length > 50) {
        errors.codigo = 'Ingresá un código de hasta 50 caracteres.';
    }
    if (!values.nombre.trim() || values.nombre.trim().length > 120) {
        errors.nombre = 'Ingresá un nombre de hasta 120 caracteres.';
    }
    if (values.precio === '' || !Number.isFinite(Number(values.precio)) || Number(values.precio) < 0) {
        errors.precio = 'Ingresá un precio mayor o igual a cero.';
    }
    if (values.stock === '' || !Number.isSafeInteger(Number(values.stock)) || Number(values.stock) < 0) {
        errors.stock = 'Ingresá una cantidad entera mayor o igual a cero.';
    }
    return errors;
}

export function toProductPayload(values) {
    return {
        codigo: values.codigo.trim(),
        nombre: values.nombre.trim(),
        precio: Number(values.precio),
        stock: Number(values.stock)
    };
}

export const formatMoney = (value) => new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS'
}).format(value);

export function stockStatus(stock) {
    if (stock === 0) return { label: 'Sin stock', className: 'stock-empty' };
    if (stock <= 5) return { label: 'Stock bajo', className: 'stock-low' };
    return { label: 'Disponible', className: 'stock-available' };
}