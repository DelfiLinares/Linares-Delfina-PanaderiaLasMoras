import { Link } from 'react-router-dom';
import { Wheat } from 'lucide-react';
import { formatMoney } from '../utils/product.js';
import StockBadge from './StockBadge.jsx';
import ProductActions from './ProductActions.jsx';

export default function ProductCard({ product, onDeleted }) {
    return (
        <article className="product-card">
            <div className="product-card-top"><span className="product-seal"><Wheat size={24} aria-hidden="true" /></span><StockBadge stock={product.stock} /></div>
            <span className="product-code">{product.codigo}</span>
            <h2><Link className="product-name" to={`/productos/detalle/${encodeURIComponent(product.codigo)}`}>{product.nombre}</Link></h2>
            <div className="product-card-numbers"><span className="card-price">{formatMoney(product.precio)}</span><span>{product.stock} unidades</span></div>
            <div className="product-card-footer"><span>Las Moras</span><ProductActions product={product} onDeleted={onDeleted} /></div>
        </article>
    );
}