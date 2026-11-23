import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoaderCircle, Minus, Plus, ShoppingBasket, Trash2, TriangleAlert } from 'lucide-react';
import { useTienda } from '../components/Tienda.jsx';
import { useNotify } from '../components/Notifications.jsx';
import { formatMoney } from '../utils/product.js';

export default function CartPage() {
    const { carrito, changeQuantity, removeItem, emptyCart, checkout } = useTienda();
    const notify = useNotify();
    const navigate = useNavigate();
    const [busy, setBusy] = useState(false);

    async function run(action, successMessage) {
        if (busy) return;
        setBusy(true);
        try {
            const result = await action();
            if (successMessage) notify('success', successMessage(result));
            return result;
        } catch (error) {
            notify('error', error.message);
        } finally {
            setBusy(false);
        }
    }

    async function handleCheckout() {
        const pedido = await run(checkout, (order) => `¡Compra confirmada! Tu pedido #${order.numero} quedó registrado.`);
        if (pedido) navigate('/pedidos');
    }

    return (
        <>
            <div className="page-heading"><div><p className="eyebrow">TU COMPRA</p><h1>Carrito</h1></div></div>
            {!carrito?.items.length ? (
                        <div className="empty-state"><ShoppingBasket size={38} aria-hidden="true" />
                            <h2>Tu carrito está vacío</h2>
                            <p>Mirá el menú y sumá lo que más te guste.</p>
                            <Link className="button button-primary" to="/menu">Ver el menú</Link>
                        </div>
                    ) : (
                        <div className="cart-layout" aria-busy={busy}>
                            <ul className="cart-list">
                                {carrito.items.map((item) => {
                                    const lowered = Math.min(item.cantidad - 1, item.stock);
                                    return (
                                    <li className="cart-item" key={item.codigo}>
                                        <div className="cart-item-info">
                                            <span className="product-name">{item.nombre}</span>
                                            <span className="product-code">{formatMoney(item.precio)} c/u</span>
                                            {item.cantidad > item.stock && <span className="cart-warning"><TriangleAlert size={14} aria-hidden="true" /> Solo quedan {item.stock} disponibles</span>}
                                        </div>
                                        <div className="quantity-stepper" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                                            <button className="icon-button" type="button" disabled={busy || lowered < 1} aria-label={`Quitar una unidad de ${item.nombre}`}
                                                onClick={() => run(() => changeQuantity(item.codigo, lowered))}><Minus size={16} /></button>
                                            <output aria-live="polite">{item.cantidad}</output>
                                            <button className="icon-button" type="button" disabled={busy || item.cantidad >= item.stock} aria-label={`Agregar una unidad de ${item.nombre}`}
                                                onClick={() => run(() => changeQuantity(item.codigo, item.cantidad + 1))}><Plus size={16} /></button>
                                        </div>
                                        <strong className="cart-item-subtotal">{formatMoney(item.subtotal)}</strong>
                                        <button className="icon-button danger-text" type="button" disabled={busy} aria-label={`Quitar ${item.nombre} del carrito`} title="Quitar del carrito"
                                            onClick={() => run(() => removeItem(item.codigo), () => `Quitaste ${item.nombre} del carrito.`)}><Trash2 size={18} /></button>
                                    </li>
                                    );
                                })}
                            </ul>
                            <aside className="cart-summary" aria-label="Resumen de la compra">
                                <h2>Resumen</h2>
                                <dl>
                                    <div><dt>Unidades</dt><dd>{carrito.unidades}</dd></div>
                                    <div className="cart-total"><dt>Total</dt><dd>{formatMoney(carrito.total)}</dd></div>
                                </dl>
                                <button className="button button-primary" type="button" disabled={busy} onClick={handleCheckout}>
                                    {busy ? <LoaderCircle size={18} className="spin" /> : <ShoppingBasket size={18} />} Confirmar compra
                                </button>
                                <button className="button button-secondary" type="button" disabled={busy} onClick={() => run(emptyCart, () => 'Carrito vaciado.')}>Vaciar carrito</button>
                            </aside>
                        </div>
                    )}
        </>
    );
}
