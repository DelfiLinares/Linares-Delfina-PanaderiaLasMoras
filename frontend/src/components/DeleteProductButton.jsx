import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteProduct } from '../services/productService.js';
import { useNotify } from './Notifications.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

export default function DeleteProductButton({ product, onDeleted, compact = false }) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const notify = useNotify();

    async function handleDelete() {
        if (busy) return;
        setBusy(true);
        try {
            await deleteProduct(product.codigo);
            notify('success', `Se eliminó ${product.nombre}.`);
            setOpen(false);
            onDeleted();
        } catch (error) {
            notify('error', error.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <button className={compact ? 'icon-button danger-text' : 'button button-secondary danger-text'} type="button"
                title={`Eliminar ${product.nombre}`} aria-label={`Eliminar ${product.nombre}`} onClick={() => setOpen(true)}>
                <Trash2 size={18} />{!compact && 'Eliminar'}
            </button>
            {open && <ConfirmDialog product={product} busy={busy} onCancel={() => setOpen(false)} onConfirm={handleDelete} />}
        </>
    );
}