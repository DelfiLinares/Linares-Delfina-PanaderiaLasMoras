import { Link } from 'react-router-dom';
import { Eye, Pencil } from 'lucide-react';
import DeleteProductButton from './DeleteProductButton.jsx';

export default function ProductActions({ product, onDeleted }) {
    const codigo = encodeURIComponent(product.codigo);
    return (
        <div className="row-actions">
            <Link className="icon-button" to={`/productos/detalle/${codigo}`} title={`Ver ${product.nombre}`} aria-label={`Ver ${product.nombre}`}><Eye size={18} /></Link>
            <Link className="icon-button" to={`/productos/editar/${codigo}`} title={`Editar ${product.nombre}`} aria-label={`Editar ${product.nombre}`}><Pencil size={18} /></Link>
            <DeleteProductButton product={product} compact onDeleted={onDeleted} />
        </div>
    );
}