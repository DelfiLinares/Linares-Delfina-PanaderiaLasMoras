import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Pencil, Plus, Wheat } from 'lucide-react';
import { getProducts } from '../services/productService.js';
import { useResource } from '../utils/useResource.js';
import { formatMoney } from '../utils/product.js';
import { useTienda } from '../components/Tienda.jsx';
import { useNotify } from '../components/Notifications.jsx';
import AsyncState from '../components/AsyncState.jsx';
import EmptyCatalog from '../components/EmptyCatalog.jsx';

export default function MenuPage() {
    const { data, loading, error, reload } = useResource('products', getProducts);
    const { cliente, rol, carrito, addItem } = useTienda();
    const notify = useNotify();
    const navigate = useNavigate();
    const [adding, setAdding] = useState(null);
    const products = [...(data ?? [])].sort((first, second) => first.nombre.localeCompare(second.nombre, 'es'));

    async function handleAdd(product) {
        if (!cliente) {
            notify('error', 'Ingresá con tu DNI para agregar productos al carrito.');
            navigate('/cuenta', { state: { from: '/menu' } });
            return;
        }
        if (adding) return;
        setAdding(product.codigo);
        try {
            await addItem(product.codigo);
            notify('success', `Agregaste ${product.nombre} al carrito.`);
        } catch (addError) {
            notify('error', addError.message);
            reload();
        } finally {
            setAdding(null);
        }
    }

    return (
        <>
            <div className="page-heading">
                <div><p className="eyebrow">NUESTRA CARTA</p><h1>Menú</h1></div>
                {rol === 'empleado' && <Link className="button button-primary" to="/productos/nuevo"><Plus size={18} /> Agregar al menú</Link>}
            </div>
            {loading || error ? <AsyncState loading={loading} error={error} onRetry={reload} /> : products.length === 0 ? <EmptyCatalog /> : (
                <section className="menu-board" aria-labelledby="menu-title">
                    <div className="menu-board-head">
                        <Wheat size={28} aria-hidden="true" />
                        <h2 id="menu-title">Las Moras</h2>
                        <p>Panadería & pastelería artesanal</p>
                    </div>
                    <ul className="menu-list">
                        {products.map((product) => {
                            const enCarrito = carrito?.items.find((item) => item.codigo === product.codigo)?.cantidad ?? 0;
                            return (
                                <li key={product.codigo} className={product.stock === 0 ? 'menu-item menu-item-soldout' : 'menu-item'}>
                                    <span className="menu-item-name">{product.nombre}{product.stock === 0 && <small>Agotado</small>}</span>
                                    <span className="menu-item-dots" aria-hidden="true" />
                                    <span className="menu-item-price">{formatMoney(product.precio)}</span>
                                    {rol === 'empleado' ? (
                                        <Link className="menu-add" to={`/productos/editar/${encodeURIComponent(product.codigo)}`} aria-label={`Editar ${product.nombre}`} title="Editar producto"><Pencil size={15} /></Link>
                                    ) : (
                                        <button className="menu-add" type="button" disabled={product.stock === 0 || adding === product.codigo || enCarrito >= product.stock}
                                            onClick={() => handleAdd(product)} aria-label={`Agregar ${product.nombre} al carrito`} title="Agregar al carrito">
                                            {enCarrito > 0 ? <><Check size={14} />{enCarrito}</> : <Plus size={16} />}
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    <p className="results-count" role="status">{products.length} {products.length === 1 ? 'producto' : 'productos'} en el menú</p>
                </section>
            )}
        </>
    );
}
