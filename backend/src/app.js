import express from 'express';
import cors from 'cors';
import ProductoRepository from './repositories/ProductoRepository.js';
import ProductoService from './services/ProductoService.js';
import ProductoController from './controllers/ProductoController.js';
import { createProductoRoutes } from './routes/productoRoutes.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp({ repository = new ProductoRepository() } = {}) {
    const app = express();
    const service = new ProductoService(repository);
    const controller = new ProductoController(service);

    app.disable('x-powered-by');
    app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
    app.use(express.json({ limit: '100kb' }));
    app.use('/products', createProductoRoutes(controller));
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}