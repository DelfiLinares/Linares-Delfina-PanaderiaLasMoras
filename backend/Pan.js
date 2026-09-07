import Producto from './Producto.js';

class Pan extends Producto {
    constructor(codigo, nombre, precio, stock, tipoMasa, peso){
        super(codigo, nombre, precio, stock);
        this.tipoMasa = tipoMasa;
        this.peso = peso;
    }
}

export default Pan;
