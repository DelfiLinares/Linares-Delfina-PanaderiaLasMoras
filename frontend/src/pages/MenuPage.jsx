import { Link } from 'react-router-dom';
import { Plus, Wheat } from 'lucide-react';
import { getProducts } from '../services/productService.js';
import { useResource } from '../utils/useResource.js';
import { formatMoney } from '../utils/product.js';
import AsyncState from '../components/AsyncState.jsx';
import EmptyCatalog from '../components/EmptyCatalog.jsx';

export default function MenuPage() {
    const { data, loading, error, reload } = useResource('products', getProducts);
    const products = [...(data ?? [])].sort((first, second) => first.nombre.localeCompare(second.nombre, 'es'));

    return (
        <>
            <div className="page-heading">
                <div><p className="eyebrow">NUESTRA CARTA</p><h1>Menú</h1></div>
                <Link className="button button-primary" to="/productos/nuevo"><Plus size={18} /> Nuevo producto</Link>
            </div>
            {loading || error ? <AsyncState loading={loading} error={error} onRetry={reload} /> : products.length === 0 ? <EmptyCatalog /> : (
                <section className="menu-board" aria-labelledby="menu-title">
                    <div className="menu-board-head">
                        <Wheat size={28} aria-hidden="true" />
                        <h2 id="menu-title">Las Moras</h2>
                        <p>Panadería & pastelería artesanal</p>
                    </div>
                    <ul className="menu-list">
                        {products.map((product) => (
                            <li key={product.codigo} className={product.stock === 0 ? 'menu-item menu-item-soldout' : 'menu-item'}>
                                <span className="menu-item-name">{product.nombre}{product.stock === 0 && <small>Agotado</small>}</span>
                                <span className="menu-item-dots" aria-hidden="true" />
                                <span className="menu-item-price">{formatMoney(product.precio)}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="results-count" role="status">{products.length} {products.length === 1 ? 'producto' : 'productos'} en el menú</p>
                </section>
            )}
        </>
    );
}
