import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Package, Plus, Wheat } from 'lucide-react';

export default function Layout() {
    const location = useLocation();
    const mainRef = useRef(null);

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
                    <Link className="brand" to="/productos" aria-label="Las Moras, inicio"><Wheat size={26} aria-hidden="true" /><span>Las Moras<small>PANADERÍA ARTESANAL</small></span></Link>
                    <nav aria-label="Navegación principal">
                        <NavLink className="nav-item" to="/menu"><BookOpen size={16} /> Menú</NavLink>
                        <NavLink className="nav-item" to="/productos" end><Package size={16} /> Productos</NavLink>
                        <NavLink className="nav-item" to="/productos/nuevo"><Plus size={16} /> Nuevo producto</NavLink>
                    </nav>
                    <span className="workspace-label">Administración</span>
                </div>
            </header>
            <div className="workspace">
                <main id="main-content" ref={mainRef} tabIndex={-1}><Outlet /></main>
                <footer className="page-footer"><span className="footer-brand">Las Moras</span><span>Panadería artesanal</span><span>Gestión del catálogo</span></footer>
            </div>
        </div>
    );
}