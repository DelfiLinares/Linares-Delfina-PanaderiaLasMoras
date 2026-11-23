import { CircleAlert, LoaderCircle, RefreshCw } from 'lucide-react';

export default function AsyncState({ loading, error, onRetry }) {
    if (loading) {
        return <div className="async-state" role="status"><LoaderCircle className="spin" aria-hidden="true" /> Cargando productos...</div>;
    }
    return (
        <div className="async-state error-state">
            <CircleAlert size={30} aria-hidden="true" />
            <h2>No pudimos cargar la información</h2>
            <p>{error}</p>
            <button className="button button-secondary" onClick={onRetry} type="button"><RefreshCw size={17} /> Reintentar</button>
        </div>
    );
}