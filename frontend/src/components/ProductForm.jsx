import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle, Save } from 'lucide-react';
import { validateProduct, toProductPayload } from '../utils/product.js';
import { useNotify } from './Notifications.jsx';
import FormField from './FormField.jsx';

export default function ProductForm({ product, onSave }) {
    const [values, setValues] = useState({ codigo: product?.codigo ?? '', nombre: product?.nombre ?? '',
        precio: String(product?.precio ?? ''), stock: String(product?.stock ?? '') });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const formRef = useRef(null);
    const notify = useNotify();
    const cancelPath = product ? `/productos/detalle/${encodeURIComponent(product.codigo)}` : '/productos';

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: undefined }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (saving) return;
        const validationErrors = validateProduct(values);
        setErrors(validationErrors);
        const firstError = Object.keys(validationErrors)[0];
        if (firstError) {
            notify('error', 'Revisá los campos marcados antes de guardar.');
            formRef.current.elements.namedItem(firstError)?.focus();
            return;
        }
        setSaving(true);
        try {
            await onSave(toProductPayload(values));
        } catch (error) {
            notify('error', error.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="product-form" aria-busy={saving}>
            <fieldset disabled={saving}>
                <legend>Información del producto</legend>
                <div className="form-grid">
                    <FormField name="codigo" label="Código" value={values.codigo} onChange={handleChange} required maxLength={50}
                        readOnly={Boolean(product)} error={errors.codigo} hint={product ? 'El código no se puede modificar.' : 'Identificador único del producto.'} autoComplete="off" />
                    <FormField name="nombre" label="Nombre" value={values.nombre} onChange={handleChange} required maxLength={120} error={errors.nombre} autoComplete="off" />
                    <FormField name="precio" label="Precio (ARS)" type="number" min="0" step="any" inputMode="decimal" value={values.precio} onChange={handleChange} required error={errors.precio} />
                    <FormField name="stock" label="Stock (unidades)" type="number" min="0" step="1" inputMode="numeric" value={values.stock} onChange={handleChange} required error={errors.stock} />
                </div>
            </fieldset>
            <div className="form-actions">
                {saving ? <span className="button button-secondary disabled">Cancelar</span> : <Link className="button button-secondary" to={cancelPath}>Cancelar</Link>}
                <button className="button button-primary" type="submit" disabled={saving}>
                    {saving ? <LoaderCircle size={18} className="spin" /> : <Save size={18} />} {saving ? 'Guardando...' : 'Guardar producto'}
                </button>
            </div>
        </form>
    );
}