export default function FormField({ name, label, error, hint, ...inputProps }) {
    return (
        <div className="form-field">
            <label htmlFor={name}>{label}</label>
            <input id={name} name={name} {...inputProps} aria-invalid={Boolean(error)}
                aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined} />
            {error ? <p className="field-error" id={`${name}-error`}>{error}</p>
                : hint && <p className="field-hint" id={`${name}-hint`}>{hint}</p>}
        </div>
    );
}