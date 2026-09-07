import Producto from './Producto.js';

class Torta extends Producto {
    constructor(codigo, nombre, precio, stock, sabor, tamano){
        super(codigo, nombre, precio, stock);
        this.sabor = sabor;
        this.tamano = tamano;
    }
}

export default Torta;
