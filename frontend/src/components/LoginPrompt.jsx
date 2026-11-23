import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function LoginPrompt({ message, from }) {
    return (
        <div className="empty-state"><LogIn size={38} aria-hidden="true" />
            <h2>Necesitás ingresar</h2>
            <p>{message}</p>
            <Link className="button button-primary" to="/cuenta" state={{ from }}>Ingresar o registrarme</Link>
        </div>
    );
}
