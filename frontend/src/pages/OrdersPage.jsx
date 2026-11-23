import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, XCircle } from 'lucide-react';
import { cancelOrder, getOrders } from '../services/tiendaService.js';
import { useResource } from '../utils/useResource.js';
import { useTienda } from '../components/Tienda.jsx';
import { useNotify } from '../components/Notifications.jsx';
import { formatMoney } from '../utils/product.js';
import { formatDate } from '../utils/cliente.js';
import AsyncState from '../components/AsyncState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function OrdersPage() {
    const { cliente } = useTienda();
    const notify = useNotify();
    const { data, loading, error, reload } = useResource(`orders-${cliente.dni}`, (signal) => getOrders(cliente.dni, signal));
    const [toCancel, setToCancel] = useState(null);
    const [busy, setBusy] = useState(false);

    async function handleCancel() {
        if (busy) return;
        setBusy(true);
        try {
            await cancelOrder(toCancel.numero, cliente.dni);
            notify('success', `Se canceló el pedido #${toCancel.numero}. El stock fue repuesto.`);
            setToCancel(null);
            reload();
        } catch (cancelError) {
            notify('error', cancelError.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <div className="page-heading"><div><p className="eyebrow">TUS COMPRAS</p><h1>Mis pedidos</h1></div></div>
            {loading || error ? <AsyncState loading={loading} error={error} onRetry={reload} />
                        : data.length === 0 ? (
                            <div className="empty-state"><Receipt size={38} aria-hidden="true" />
                                <h2>Todavía no hiciste pedidos</h2>
                                <p>Cuando confirmes una compra la vas a ver acá.</p>
                                <Link className="button button-primary" to="/menu">Ver el menú</Link>
                            </div>
                        ) : (
                            <ul className="order-list">
                                {data.map((order) => (
                                    <li className={`order-card${order.estado === 'cancelado' ? ' order-cancelled' : ''}`} key={order.numero}>
                                        <div className="order-head">
                                            <div><h2>Pedido #{order.numero}</h2><span className="product-code">{formatDate(order.fecha)}</span></div>
                                            <span className={`order-status order-status-${order.estado}`}>{order.estado === 'cancelado' ? 'Cancelado' : 'Confirmado'}</span>
                                        </div>
                                        <ul className="order-lines">
                                            {order.detalles.map((detalle) => (
                                                <li key={detalle.producto.codigo}>
                                                    <span>{detalle.cantidad} × {detalle.producto.nombre}</span>
                                                    <span className="numeric">{formatMoney(detalle.subtotal)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="order-foot">
                                            <strong>Total {formatMoney(order.total)}</strong>
                                            {order.estado === 'confirmado' && (
                                                <button className="button button-secondary danger-text" type="button" onClick={() => setToCancel(order)}><XCircle size={17} /> Cancelar pedido</button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
            {toCancel && (
                <ConfirmDialog title="¿Cancelar este pedido?" confirmLabel="Cancelar pedido" busyLabel="Cancelando..." cancelLabel="Volver"
                    busy={busy} onCancel={() => setToCancel(null)} onConfirm={handleCancel}>
                    Se cancelará el pedido <strong>#{toCancel.numero}</strong> por {formatMoney(toCancel.total)} y se repondrá el stock de los productos.
                </ConfirmDialog>
            )}
        </>
    );
}
