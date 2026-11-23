import { useEffect, useRef } from 'react';
import { LoaderCircle, Trash2 } from 'lucide-react';

export default function ConfirmDialog({ title, children, confirmLabel, busyLabel, cancelLabel = 'Cancelar', busy, onCancel, onConfirm }) {
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
            <h2 id="delete-title">{title}</h2>
            <p id="delete-description">{children}</p>
            <div className="form-actions">
                <button className="button button-secondary" type="button" onClick={onCancel} disabled={busy} autoFocus>{cancelLabel}</button>
                <button className="button button-danger" type="button" onClick={onConfirm} disabled={busy}>
                    {busy ? <LoaderCircle className="spin" size={17} /> : <Trash2 size={17} />} {busy ? busyLabel : confirmLabel}
                </button>
            </div>
        </dialog>
    );
}