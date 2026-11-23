import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { getProduct } from '../services/productService.js';
import { useResource } from '../utils/useResource.js';
import { formatMoney } from '../utils/product.js';
import AsyncState from '../components/AsyncState.jsx';
import StockBadge from '../components/StockBadge.jsx';
import DeleteProductButton from '../components/DeleteProductButton.jsx';

export default function ProductDetailPage() {
    const { codigo } = useParams();
    const navigate = useNavigate();
    const { data: product, loading, error, reload } = useResource(codigo, (signal) => getProduct(codigo, signal));

    return (
        <>
            <Link className="back-link" to="/productos"><ArrowLeft size={17} /> Productos</Link>
            {loading || error ? <AsyncState loading={loading} error={error} onRetry={reload} /> : product && (
                <>
                    <div className="page-heading">
                        <div><p className="eyebrow">DETALLE DEL PRODUCTO</p><h1>{product.nombre}</h1></div>
                        <div className="heading-actions">
                            <DeleteProductButton product={product} onDeleted={() => navigate('/productos')} />
                            <Link className="button button-primary" to={`/productos/editar/${encodeURIComponent(codigo)}`}><Pencil size={17} /> Editar producto</Link>
                        </div>
                    </div>
                    <section className="detail-section" aria-label="Información del producto">
                        <StockBadge stock={product.stock} />
                        <dl className="detail-grid">
                            <div><dt>Código</dt><dd>{product.codigo}</dd></div>
                            <div><dt>Nombre</dt><dd>{product.nombre}</dd></div>
                            <div><dt>Precio</dt><dd>{formatMoney(product.precio)}</dd></div>
                            <div><dt>Stock</dt><dd>{product.stock} unidades</dd></div>
                        </dl>
                    </section>
                </>
            )}
        </>
    );
}