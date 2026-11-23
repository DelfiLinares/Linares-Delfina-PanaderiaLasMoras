import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    return <div className="empty-state"><h1>Página no encontrada</h1><Link className="button button-primary" to="/"><ArrowLeft size={17} /> Volver al inicio</Link></div>;
}