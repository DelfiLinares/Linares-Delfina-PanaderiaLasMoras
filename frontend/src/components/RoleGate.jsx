import { Link, useLocation } from 'react-router-dom';
import { LoaderCircle, ShieldAlert } from 'lucide-react';
import { useTienda } from './Tienda.jsx';
import LoginPrompt from './LoginPrompt.jsx';

const GUEST_MESSAGE = {
    empleado: 'Ingresá como empleado para gestionar los productos del menú.',
    cliente: 'Ingresá con tu DNI para armar tu carrito y ver tus pedidos.'
};
const WRONG_ROLE_MESSAGE = {
    empleado: 'Esta sección es solo para empleados de Las Moras.',
    cliente: 'Los empleados no pueden realizar compras.'
};

// Muestra el contenido solo al rol indicado; el backend aplica las mismas reglas.
export default function RoleGate({ rol, children }) {
    const { ready, rol: currentRole } = useTienda();
    const location = useLocation();

    if (!ready) {
        return <div className="async-state" role="status"><LoaderCircle className="spin" aria-hidden="true" /> Cargando...</div>;
    }
    if (currentRole === rol) {
        return children;
    }
    if (!currentRole) {
        return <LoginPrompt message={GUEST_MESSAGE[rol]} from={location.pathname} />;
    }
    return (
        <div className="empty-state"><ShieldAlert size={38} aria-hidden="true" />
            <h2>Sección no disponible</h2>
            <p>{WRONG_ROLE_MESSAGE[rol]}</p>
            <Link className="button button-primary" to={currentRole === 'empleado' ? '/productos' : '/menu'}>
                {currentRole === 'empleado' ? 'Ir a productos' : 'Ver el menú'}
            </Link>
        </div>
    );
}
