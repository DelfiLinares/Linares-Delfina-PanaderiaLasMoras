import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { NotificationProvider } from './components/Notifications.jsx';
import { TiendaProvider } from './components/Tienda.jsx';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <NotificationProvider><TiendaProvider><App /></TiendaProvider></NotificationProvider>
        </BrowserRouter>
    </StrictMode>
);