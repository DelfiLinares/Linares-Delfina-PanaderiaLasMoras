import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CheckCircle2, Package, ShoppingBasket } from 'lucide-react';
import { getProducts } from '../services/productService.js';
import { useResource } from '../utils/useResource.js';
import { formatMoney } from '../utils/product.js';
import { useTienda } from '../components/Tienda.jsx';
import croissantsPhoto from '../assets/croissants.jpg';
import bakeryPhoto from '../assets/panaderia.jpg';
import pastryPhoto from '../assets/pasteleria.jpg';

const steps = [
    { icon: BookOpen, title: 'Elegí del menú', text: 'Mirá todo lo que horneamos con sus precios y sumalo con un toque.' },
    { icon: ShoppingBasket, title: 'Armá tu carrito', text: 'Ajustá las cantidades o quitá lo que no quieras antes de confirmar.' },
    { icon: CheckCircle2, title: 'Confirmá tu pedido', text: 'Queda registrado en Mis pedidos y, si te arrepentís, podés cancelarlo.' }
];

export default function HomePage() {
    const { cliente, empleado, rol } = useTienda();
    const user = cliente ?? empleado;
    const { data } = useResource('home-products', getProducts);
    const featured = (data ?? []).filter((product) => product.stock > 0).slice(0, 3);

    return (
        <>
            <section className="catalog-empty home-hero" aria-labelledby="home-title">
                <div className="empty-feature">
                    <img src={croissantsPhoto} alt="Fotografía ilustrativa de croissants artesanales" width="1100" height="800" />
                    <div className="empty-feature-copy">
                        <span className="photo-eyebrow">LAS MORAS · PANADERÍA & PASTELERÍA</span>
                        <h1 id="home-title">Pan y dulces{' '}<br />recién horneados.</h1>
                        <p>
                            {user ? `¡Hola, ${user.nombre.split(' ')[0]}! ` : ''}
                            {rol === 'empleado' ? 'Gestioná los productos del menú de Las Moras.' : 'Elegí del menú, armá tu carrito y hacé tu pedido en minutos.'}
                        </p>
                        <div className="home-actions">
                            <Link className="button button-light" to="/menu">Ver el menú <ArrowUpRight size={18} /></Link>
                            {rol === 'empleado' && <Link className="button button-ghost" to="/productos"><Package size={18} /> Gestionar productos</Link>}
                            {rol === 'cliente' && <Link className="button button-ghost" to="/carrito"><ShoppingBasket size={18} /> Ir al carrito</Link>}
                            {!rol && <Link className="button button-ghost" to="/cuenta">Ingresar o registrarme</Link>}
                        </div>
                    </div>
                </div>
                <div className="empty-photo-pair" aria-label="Inspiración de panadería y pastelería">
                    <img src={bakeryPhoto} alt="Fotografía ilustrativa de panes con semillas" width="800" height="600" />
                    <img src={pastryPhoto} alt="Fotografía ilustrativa de una torta decorada" width="700" height="600" />
                </div>
            </section>

            {featured.length > 0 && (
                <section className="home-section" aria-labelledby="featured-title">
                    <div className="home-section-head">
                        <h2 id="featured-title">Para hoy</h2>
                        <Link className="back-link" to="/menu">Ver todo el menú <ArrowUpRight size={15} /></Link>
                    </div>
                    <ul className="home-featured">
                        {featured.map((product) => (
                            <li key={product.codigo}>
                                <Link to="/menu">
                                    <span className="product-name">{product.nombre}</span>
                                    <span className="card-price">{formatMoney(product.precio)}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {rol !== 'empleado' && (
            <section className="home-section" aria-labelledby="steps-title">
                <h2 id="steps-title">Comprar es fácil</h2>
                <ol className="home-steps">
                    {steps.map(({ icon: Icon, title, text }, index) => (
                        <li key={title}>
                            <span className="home-step-icon"><Icon size={22} aria-hidden="true" /></span>
                            <h3><span>{index + 1}.</span> {title}</h3>
                            <p>{text}</p>
                        </li>
                    ))}
                </ol>
            </section>
            )}
        </>
    );
}
