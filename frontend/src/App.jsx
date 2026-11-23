import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Navigate to="/productos" replace />} />
                <Route path="productos" element={<ProductsPage />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="productos/nuevo" element={<ProductFormPage key="create" />} />
                <Route path="productos/detalle/:codigo" element={<ProductDetailPage />} />
                <Route path="productos/editar/:codigo" element={<ProductFormPage key="edit" editing />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}