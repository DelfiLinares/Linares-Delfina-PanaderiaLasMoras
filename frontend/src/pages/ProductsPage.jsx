import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, LayoutGrid, List, Package, Plus, RefreshCw, Search, X } from 'lucide-react';
import { getProducts } from '../services/productService.js';
import { useResource } from '../utils/useResource.js';
import { formatMoney } from '../utils/product.js';
import AsyncState from '../components/AsyncState.jsx';
import StockBadge from '../components/StockBadge.jsx';
import ProductActions from '../components/ProductActions.jsx';
import ProductCard from '../components/ProductCard.jsx';
import EmptyCatalog from '../components/EmptyCatalog.jsx';

export default function ProductsPage() {
    const { data, loading, error, reload } = useResource('products', getProducts);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('nombre');
    const [view, setView] = useState('grid');
    const deferredQuery = useDeferredValue(query);
    const products = data ?? [];
    const normalizedQuery = deferredQuery.trim().toLocaleLowerCase('es');
    const visible = products.filter((product) => (
        `${product.nombre} ${product.codigo}`.toLocaleLowerCase('es').includes(normalizedQuery)
        && (filter === 'all' || (filter === 'empty' ? product.stock === 0 : product.stock > 0 && product.stock <= 5))
    )).sort((first, second) => sort === 'nombre' ? first.nombre.localeCompare(second.nombre, 'es') : first[sort] - second[sort]);

    return (
        <>
            <div className="page-heading">
                <div><p className="eyebrow">HECHO EN LAS MORAS</p><h1>Productos</h1></div>
                <Link className="button button-primary" to="/productos/nuevo"><Plus size={18} /> Nuevo producto</Link>
            </div>
            {loading || error ? <AsyncState loading={loading} error={error} onRetry={reload} /> : (
                <>
                    {products.length > 0 && <dl className="metrics" aria-label="Resumen de productos">
                        <div><dt>Productos registrados</dt><dd>{products.length}</dd></div>
                        <div><dt>Unidades disponibles</dt><dd>{products.reduce((total, product) => total + product.stock, 0)}</dd></div>
                        <div><dt>Sin stock</dt><dd>{products.filter((product) => product.stock === 0).length}</dd></div>
                    </dl>}
                    {products.length > 0 && <div className="catalog-toolbar">
                        <div className="search-field"><Search size={18} aria-hidden="true" />
                            <label className="sr-only" htmlFor="search">Buscar por nombre o código</label>
                            <input id="search" type="search" placeholder="Buscar por nombre o código" value={query} onChange={(event) => setQuery(event.target.value)} />
                        </div>
                        <div className="toolbar-controls">
                            <label className="sr-only" htmlFor="stock-filter">Filtrar por stock</label>
                            <select id="stock-filter" value={filter} onChange={(event) => setFilter(event.target.value)}>
                                <option value="all">Todo el stock</option><option value="low">Stock bajo</option><option value="empty">Sin stock</option>
                            </select>
                            <ArrowUpDown size={16} aria-hidden="true" />
                            <label className="sr-only" htmlFor="sort">Ordenar productos</label>
                            <select id="sort" value={sort} onChange={(event) => setSort(event.target.value)}>
                                <option value="nombre">Nombre</option><option value="precio">Precio</option><option value="stock">Stock</option>
                            </select>
                            <button className="icon-button" type="button" onClick={reload} aria-label="Actualizar productos" title="Actualizar productos"><RefreshCw size={18} /></button>
                            <div className="view-switch" role="group" aria-label="Vista del catálogo">
                                <button className="icon-button" type="button" aria-label="Ver tarjetas" title="Ver tarjetas" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><LayoutGrid size={18} /></button>
                                <button className="icon-button" type="button" aria-label="Ver lista" title="Ver lista" aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={18} /></button>
                            </div>
                        </div>
                    </div>}
                    {visible.length ? view === 'grid' ? (
                        <div className="product-grid">{visible.map((product) => <ProductCard key={product.codigo} product={product} onDeleted={reload} />)}</div>
                    ) : (
                        <div className="table-scroll">
                            <table className="product-table">
                                <caption className="sr-only">Catálogo de productos de Las Moras</caption>
                                <thead><tr><th scope="col">Producto</th><th scope="col">Precio</th><th scope="col">Stock</th><th scope="col">Estado</th><th scope="col" className="actions-heading">Acciones</th></tr></thead>
                                <tbody>{visible.map((product) => (
                                    <tr key={product.codigo}>
                                        <th scope="row"><Link className="product-name" to={`/productos/detalle/${encodeURIComponent(product.codigo)}`}>{product.nombre}</Link><span className="product-code">{product.codigo}</span></th>
                                        <td className="numeric">{formatMoney(product.precio)}</td><td className="numeric">{product.stock} <span className="muted">u.</span></td>
                                        <td><StockBadge stock={product.stock} /></td>
                                        <td><ProductActions product={product} onDeleted={reload} /></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    ) : products.length === 0 ? <EmptyCatalog /> : (
                        <div className="empty-state"><Package size={38} aria-hidden="true" />
                            <h2>No hay coincidencias</h2>
                            <p>No encontramos productos con estos filtros.</p>
                            <button className="button button-secondary" type="button" onClick={() => { setQuery(''); setFilter('all'); }}><X size={17} /> Limpiar filtros</button>
                        </div>
                    )}
                    {products.length > 0 && <p className="results-count" role="status">{visible.length} de {products.length} productos</p>}
                </>
            )}
        </>
    );
}