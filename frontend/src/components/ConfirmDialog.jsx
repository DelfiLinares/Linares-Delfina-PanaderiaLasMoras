import { useEffect, useRef } from 'react';
import { LoaderCircle, Trash2 } from 'lucide-react';

export default function ConfirmDialog({ product, busy, onCancel, onConfirm }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        dialog.showModal();
        return () => dialog.close();
    }, []);

    return (
        <dialog ref={dialogRef} className="confirm-dialog" aria-labelledby="delete-title" aria-describedby="delete-description"
            onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }}
            onKeyDown={(event) => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!busy) onCancel();
                }
            }}>
            <div className="dialog-symbol"><Trash2 aria-hidden="true" /></div>
            <h2 id="delete-title">¿Eliminar este producto?</h2>
            <p id="delete-description">Se eliminará <strong>{product.nombre}</strong> ({product.codigo}). Esta acción no se puede deshacer.</p>
            <div className="form-actions">
                <button className="button button-secondary" type="button" onClick={onCancel} disabled={busy} autoFocus>Cancelar</button>
                <button className="button button-danger" type="button" onClick={onConfirm} disabled={busy}>
                    {busy ? <LoaderCircle className="spin" size={17} /> : <Trash2 size={17} />} {busy ? 'Eliminando...' : 'Eliminar producto'}
                </button>
            </div>
        </dialog>
    );
}