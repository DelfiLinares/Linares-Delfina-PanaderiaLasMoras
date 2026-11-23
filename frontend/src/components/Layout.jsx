import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, House, Package, Plus, Receipt, ShoppingBasket, User, Wheat } from 'lucide-react';
import { useTienda } from './Tienda.jsx';

export default function Layout() {
    const location = useLocation();
    const mainRef = useRef(null);
    const { cliente, empleado, rol, carrito } = useTienda();
    const user = cliente ?? empleado;

    useEffect(() => {
        const heading = mainRef.current.querySelector('h1');
        document.title = `Las Moras | ${heading?.textContent || 'Productos'}`;
        mainRef.current.focus();
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="app-shell">
            <a className="skip-link" href="#main-content">Saltar al contenido</a>
            <header className="site-header">
                <div className="header-inner">
                    <Link className="brand" to="/" aria-label="Las Moras, inicio"><Wheat size={26} aria-hidden="true" /><span>Las Moras<small>PANADERÍA ARTESANAL</small></span></Link>
                    <nav aria-label="Navegación principal">
                        <NavLink className="nav-item" to="/" end><House size={16} /> Inicio</NavLink>
                        <NavLink className="nav-item" to="/menu"><BookOpen size={16} /> Menú</NavLink>
                        {rol !== 'empleado' && (
                            <>
                                <NavLink className="nav-item" to="/carrito"><ShoppingBasket size={16} /> Carrito
                                    {carrito?.unidades > 0 && <span className="nav-badge" aria-label={`${carrito.unidades} unidades`}>{carrito.unidades}</span>}
                                </NavLink>
                                <NavLink className="nav-item" to="/pedidos"><Receipt size={16} /> Mis pedidos</NavLink>
                            </>
                        )}
                        {rol === 'empleado' && (
                            <>
                                <NavLink className="nav-item" to="/productos" end><Package size={16} /> Productos</NavLink>
                                <NavLink className="nav-item" to="/productos/nuevo"><Plus size={16} /> Nuevo producto</NavLink>
                            </>
                        )}
                    </nav>
                    <Link className="workspace-label account-link" to="/cuenta" title={rol ? `Sesión de ${rol}` : undefined}>
                        <User size={16} aria-hidden="true" /> {user ? user.nombre.split(' ')[0] : 'Ingresar'}
                    </Link>
                </div>
            </header>
            <div className="workspace">
                <main id="main-content" ref={mainRef} tabIndex={-1}><Outlet /></main>
                <footer className="page-footer"><span className="footer-brand">Las Moras</span><span>Panadería artesanal</span><span>Gestión del catálogo</span></footer>
            </div>
        </div>
    );
}