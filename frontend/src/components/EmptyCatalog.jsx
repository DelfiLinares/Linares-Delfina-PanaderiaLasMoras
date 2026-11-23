import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus } from 'lucide-react';
import { useTienda } from './Tienda.jsx';
import croissantsPhoto from '../assets/croissants.jpg';
import bakeryPhoto from '../assets/panaderia.jpg';
import pastryPhoto from '../assets/pasteleria.jpg';

export default function EmptyCatalog() {
    const { rol } = useTienda();
    return (
        <section className="catalog-empty" aria-labelledby="empty-catalog-title">
            <div className="empty-feature">
                <img src={croissantsPhoto} alt="Fotografía ilustrativa de croissants artesanales" width="1100" height="800" />
                <div className="empty-feature-copy">
                    <span className="photo-eyebrow">LAS MORAS · PANADERÍA & PASTELERÍA</span>
                    <h2 id="empty-catalog-title">Acá empieza<br />algo rico.</h2>
                    {rol === 'empleado' ? (
                        <>
                            <p>Todavía no hay productos registrados.</p>
                            <Link className="button button-light" to="/productos/nuevo"><Plus size={18} /> Crear primer producto <ArrowUpRight size={18} /></Link>
                        </>
                    ) : <p>Estamos preparando el menú. ¡Volvé en un ratito!</p>}
                </div>
            </div>
            <div className="empty-photo-pair" aria-label="Inspiración de panadería y pastelería">
                <img src={bakeryPhoto} alt="Fotografía ilustrativa de panes con semillas" width="800" height="600" />
                <img src={pastryPhoto} alt="Fotografía ilustrativa de una torta decorada" width="700" height="600" />
            </div>
        </section>
    );
}