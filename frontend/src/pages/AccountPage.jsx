import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoaderCircle, LogIn, LogOut, Package, Plus, Receipt, ShoppingBasket, UserPlus } from 'lucide-react';
import { useTienda } from '../components/Tienda.jsx';
import { useNotify } from '../components/Notifications.jsx';
import FormField from '../components/FormField.jsx';
import { validateClient, validateEmployee } from '../utils/cliente.js';

const EMPTY_VALUES = { dni: '', nombre: '', telefono: '', cargo: '', codigo: '' };

function SessionCard() {
    const { cliente, empleado, logout } = useTienda();
    const notify = useNotify();
    const user = cliente ?? empleado;

    async function handleLogout() {
        await logout();
        notify('success', 'Cerraste la sesión.');
    }

    return (
        <>
            <div className="page-heading"><div><p className="eyebrow">{cliente ? 'MI CUENTA · CLIENTE' : 'MI CUENTA · EMPLEADO'}</p><h1>Hola, {user.nombre}</h1></div></div>
            <section className="account-card" aria-label="Datos de la cuenta">
                <dl className="detail-grid">
                    <div><dt>DNI</dt><dd>{user.dni}</dd></div>
                    <div><dt>{cliente ? 'Teléfono' : 'Cargo'}</dt><dd>{cliente ? cliente.telefono : empleado.cargo}</dd></div>
                </dl>
                <div className="form-actions">
                    {cliente ? (
                        <>
                            <Link className="button button-secondary" to="/pedidos"><Receipt size={18} /> Mis pedidos</Link>
                            <Link className="button button-primary" to="/carrito"><ShoppingBasket size={18} /> Ver carrito</Link>
                        </>
                    ) : (
                        <>
                            <Link className="button button-secondary" to="/productos"><Package size={18} /> Productos</Link>
                            <Link className="button button-primary" to="/productos/nuevo"><Plus size={18} /> Agregar al menú</Link>
                        </>
                    )}
                    <button className="button button-secondary" type="button" onClick={handleLogout}><LogOut size={18} /> Cerrar sesión</button>
                </div>
            </section>
        </>
    );
}

export default function AccountPage() {
    const { rol, loginCliente, registerCliente, loginEmpleado, registerEmpleado } = useTienda();
    const notify = useNotify();
    const navigate = useNavigate();
    const from = useLocation().state?.from;
    const [tipo, setTipo] = useState('cliente');
    const [login, setLogin] = useState({ dni: '', codigo: '' });
    const [values, setValues] = useState(EMPTY_VALUES);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const esEmpleado = tipo === 'empleado';

    async function run(action, successMessage) {
        if (busy) return;
        setBusy(true);
        try {
            const user = await action();
            notify('success', successMessage(user));
            navigate(from ?? (esEmpleado ? '/productos' : '/menu'));
        } catch (error) {
            notify('error', error.message);
        } finally {
            setBusy(false);
        }
    }

    function handleLogin(event) {
        event.preventDefault();
        run(() => esEmpleado ? loginEmpleado(login.dni, login.codigo) : loginCliente(login.dni),
            (user) => `¡Hola de nuevo, ${user.nombre}!`);
    }

    function handleRegister(event) {
        event.preventDefault();
        const validationErrors = esEmpleado ? validateEmployee(values) : validateClient(values);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length) {
            notify('error', 'Revisá los campos marcados antes de registrarte.');
            return;
        }
        const trimmed = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, key === 'codigo' ? value : value.trim()]));
        run(() => esEmpleado
            ? registerEmpleado({ dni: trimmed.dni, nombre: trimmed.nombre, cargo: trimmed.cargo, codigo: trimmed.codigo })
            : registerCliente({ dni: trimmed.dni, nombre: trimmed.nombre, telefono: trimmed.telefono }),
        (user) => `¡Bienvenida/o a Las Moras, ${user.nombre}!`);
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: undefined }));
    }

    function changeType(newType) {
        setTipo(newType);
        setErrors({});
    }

    if (rol) {
        return <SessionCard />;
    }

    return (
        <>
            <div className="page-heading"><div><p className="eyebrow">MI CUENTA</p><h1>{esEmpleado ? 'Ingreso de empleados' : 'Ingresá para comprar'}</h1></div></div>
            <div className="role-switch" role="group" aria-label="Tipo de cuenta">
                <button type="button" aria-pressed={!esEmpleado} onClick={() => changeType('cliente')}>Soy cliente</button>
                <button type="button" aria-pressed={esEmpleado} onClick={() => changeType('empleado')}>Soy empleado</button>
            </div>
            <div className="account-grid">
                <form className="product-form" onSubmit={handleLogin} aria-busy={busy}>
                    <fieldset disabled={busy}>
                        <legend>{esEmpleado ? 'Ya estoy registrado' : 'Ya soy cliente'}</legend>
                        <div className="form-stack">
                            <FormField name="loginDni" label="DNI" value={login.dni} onChange={(event) => setLogin((current) => ({ ...current, dni: event.target.value }))}
                                inputMode="numeric" autoComplete="off" required hint="Ingresá el DNI con el que te registraste." />
                            {esEmpleado && <FormField name="loginCodigo" label="Código de empleado" type="password" value={login.codigo}
                                onChange={(event) => setLogin((current) => ({ ...current, codigo: event.target.value }))} autoComplete="off" required />}
                        </div>
                    </fieldset>
                    <div className="form-actions">
                        <button className="button button-primary" type="submit" disabled={busy}>
                            {busy ? <LoaderCircle size={18} className="spin" /> : <LogIn size={18} />} Ingresar
                        </button>
                    </div>
                </form>
                <form className="product-form" onSubmit={handleRegister} noValidate aria-busy={busy}>
                    <fieldset disabled={busy}>
                        <legend>{esEmpleado ? 'Soy un empleado nuevo' : 'Soy nuevo'}</legend>
                        <div className="form-stack">
                            <FormField name="dni" label="DNI" value={values.dni} onChange={handleChange} inputMode="numeric" autoComplete="off" required error={errors.dni} />
                            <FormField name="nombre" label="Nombre y apellido" value={values.nombre} onChange={handleChange} maxLength={120} autoComplete="name" required error={errors.nombre} />
                            {esEmpleado ? (
                                <>
                                    <FormField name="cargo" label="Cargo" value={values.cargo} onChange={handleChange} maxLength={60} autoComplete="off" required error={errors.cargo} hint="Por ejemplo: Panadero, Pastelera, Encargado." />
                                    <FormField name="codigo" label="Código de empleado" type="password" value={values.codigo} onChange={handleChange} autoComplete="off" required error={errors.codigo} hint="Te lo da la panadería: sin él no se puede registrar un empleado." />
                                </>
                            ) : (
                                <FormField name="telefono" label="Teléfono" value={values.telefono} onChange={handleChange} inputMode="tel" autoComplete="tel" required error={errors.telefono} />
                            )}
                        </div>
                    </fieldset>
                    <div className="form-actions">
                        <button className="button button-primary" type="submit" disabled={busy}>
                            {busy ? <LoaderCircle size={18} className="spin" /> : <UserPlus size={18} />} Registrarme
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
