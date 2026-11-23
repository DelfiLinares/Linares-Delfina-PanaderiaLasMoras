import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createProduct, getProduct, updateProduct } from '../services/productService.js';
import { useResource } from '../utils/useResource.js';
import { useNotify } from '../components/Notifications.jsx';
import ProductForm from '../components/ProductForm.jsx';
import AsyncState from '../components/AsyncState.jsx';

export default function ProductFormPage({ editing = false }) {
    const { codigo } = useParams();
    const navigate = useNavigate();
    const notify = useNotify();
    const { data: product, loading, error, reload } = useResource(codigo, (signal) => getProduct(codigo, signal), editing);

    async function save(data) {
        const saved = editing ? await updateProduct(codigo, data) : await createProduct(data);
        notify('success', editing ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
        navigate(`/productos/detalle/${encodeURIComponent(saved.codigo)}`);
    }

    return (
        <>
            <Link className="back-link" to="/productos"><ArrowLeft size={17} /> Productos</Link>
            <div className="page-heading"><div><p className="eyebrow">CATÁLOGO</p><h1>{editing ? 'Editar producto' : 'Nuevo producto'}</h1></div></div>
            {editing && (loading || error) ? <AsyncState loading={loading} error={error} onRetry={reload} />
                : (!editing || product) && <ProductForm key={editing ? product.codigo : 'new'} product={editing ? product : null} onSave={save} />}
        </>
    );
}