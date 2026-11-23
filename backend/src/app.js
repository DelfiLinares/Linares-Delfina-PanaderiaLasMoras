import express from 'express';
import cors from 'cors';
import ProductoRepository from './repositories/ProductoRepository.js';
import ClienteRepository from './repositories/ClienteRepository.js';
import CarritoRepository from './repositories/CarritoRepository.js';
import PedidoRepository from './repositories/PedidoRepository.js';
import EmpleadoRepository from './repositories/EmpleadoRepository.js';
import SesionRepository from './repositories/SesionRepository.js';
import ProductoService from './services/ProductoService.js';
import ClienteService from './services/ClienteService.js';
import EmpleadoService from './services/EmpleadoService.js';
import CarritoService from './services/CarritoService.js';
import PedidoService from './services/PedidoService.js';
import ProductoController from './controllers/ProductoController.js';
import ClienteController from './controllers/ClienteController.js';
import EmpleadoController from './controllers/EmpleadoController.js';
import CarritoController from './controllers/CarritoController.js';
import PedidoController from './controllers/PedidoController.js';
import { createProductoRoutes } from './routes/productoRoutes.js';
import { createClienteRoutes } from './routes/clienteRoutes.js';
import { createEmpleadoRoutes } from './routes/empleadoRoutes.js';
import { createCarritoRoutes } from './routes/carritoRoutes.js';
import { createPedidoRoutes } from './routes/pedidoRoutes.js';
import { requireEmpleado } from './middlewares/requireEmpleado.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { CODIGO_EMPLEADO } from './config.js';

export function createApp({
    repository = new ProductoRepository(),
    clienteRepository = new ClienteRepository(),
    empleadoRepository = new EmpleadoRepository(),
    sesionRepository = new SesionRepository(),
    carritoRepository = new CarritoRepository(),
    pedidoRepository = new PedidoRepository(),
    codigoEmpleado = CODIGO_EMPLEADO
} = {}) {
    const app = express();
    const service = new ProductoService(repository);
    const controller = new ProductoController(service);
    const clienteService = new ClienteService(clienteRepository, empleadoRepository);
    const empleadoService = new EmpleadoService(empleadoRepository, clienteRepository, sesionRepository, codigoEmpleado);
    const carritoService = new CarritoService(carritoRepository, clienteService, repository);
    const pedidoService = new PedidoService(pedidoRepository, carritoService, clienteService, repository);
    const authenticate = requireEmpleado(empleadoService);

    app.disable('x-powered-by');
    app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
    app.use(express.json({ limit: '100kb' }));
    app.use('/products', createProductoRoutes(controller, authenticate));
    app.use('/clientes', createClienteRoutes(new ClienteController(clienteService)));
    app.use('/empleados', createEmpleadoRoutes(new EmpleadoController(empleadoService), authenticate));
    app.use('/carritos', createCarritoRoutes(new CarritoController(carritoService)));
    app.use('/pedidos', createPedidoRoutes(new PedidoController(pedidoService)));
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}