import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    return <div className="empty-state"><h1>Página no encontrada</h1><Link className="button button-primary" to="/productos"><ArrowLeft size={17} /> Volver a productos</Link></div>;
}