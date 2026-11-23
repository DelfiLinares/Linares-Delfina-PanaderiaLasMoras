import { Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RoleGate from './components/RoleGate.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import CartPage from './pages/CartPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="cuenta" element={<AccountPage />} />
                <Route element={<RoleGate rol="cliente"><Outlet /></RoleGate>}>
                    <Route path="carrito" element={<CartPage />} />
                    <Route path="pedidos" element={<OrdersPage />} />
                </Route>
                <Route element={<RoleGate rol="empleado"><Outlet /></RoleGate>}>
                    <Route path="productos" element={<ProductsPage />} />
                    <Route path="productos/nuevo" element={<ProductFormPage key="create" />} />
                    <Route path="productos/detalle/:codigo" element={<ProductDetailPage />} />
                    <Route path="productos/editar/:codigo" element={<ProductFormPage key="edit" editing />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}