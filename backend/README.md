# API Las Moras - Entrega 2

API REST de productos con Express y persistencia temporal en un array.
Requiere Node.js 20 o superior y npm.

## Ejecucion

Desde la raiz del repositorio:

```sh
npm install --prefix backend
npm start --prefix backend
```

La API escucha en `http://localhost:3000/products`. Para reiniciar automaticamente
al modificar archivos, usar `npm run dev --prefix backend`.
Para ejecutar las pruebas, usar `npm test --prefix backend`.

Variables opcionales del entorno: `PORT` (por defecto `3000`) y `FRONTEND_URL`
(por defecto `http://localhost:5173`, origen permitido por CORS).
En PowerShell, por ejemplo: `$env:PORT = '3001'` antes de iniciar el servidor.

## Arquitectura

Toda la implementacion reside en `backend/src`:

| Carpeta | Responsabilidad |
| --- | --- |
| `models` | Clases del dominio original |
| `repositories` | Lectura y escritura del array en memoria |
| `services` | Reglas de negocio, existencia y unicidad |
| `controllers` | Recibir datos HTTP y enviar respuestas |
| `routes` | Asociar rutas y metodos HTTP a controladores |
| `middlewares` | Errores centralizados y rutas inexistentes |
| `responses` | Formato comun de respuestas HTTP |
| `exceptions` | AppError y errores 400, 404 y 409 |
| `enums` | Mensajes centralizados en Messages |
| `utils` | Validacion de datos |

Flujo: ruta -> controlador -> servicio -> repositorio -> modelo.
`app.js` conecta las capas y `server.js` inicia el servidor.
Los archivos originales de modelos en `backend/` reexportan las clases de
`src/models` para mantener compatibles las importaciones anteriores.

## CRUD de productos

Se utiliza `codigo` como ID unico e inmutable del producto, respetando el dominio.

| Metodo | Ruta | Operacion | Estado exitoso |
| --- | --- | --- | --- |
| GET | `/products` | Obtener todos | 200 |
| GET | `/products/:codigo` | Obtener por ID | 200 |
| POST | `/products` | Crear | 201 |
| PUT | `/products/:codigo` | Reemplazar nombre, precio y stock | 200 |
| DELETE | `/products/:codigo` | Eliminar y devolver el registro | 200 |

Cuerpo JSON para POST y PUT, con `Content-Type: application/json`:

```json
{
    "codigo": "PAN-01",
    "nombre": "Pan integral",
    "precio": 1500,
    "stock": 20
}
```

Todos los campos son obligatorios. `codigo` y `nombre` son textos no vacios
(maximo 50 y 120 caracteres). `precio` es un numero finito no negativo;
`stock` es un entero seguro no negativo. No se aceptan campos adicionales.
PUT requiere el cuerpo completo y el mismo `codigo` de la URL.
Los espacios al principio y al final de los textos se eliminan.
Los codigos distinguen mayusculas de minusculas y deben codificarse con
`encodeURIComponent` al construir la URL desde el frontend.

Respuesta exitosa (`data` es un array para GET de todos y un objeto en las demas):

```json
{
    "success": true,
    "data": {
        "codigo": "PAN-01",
        "nombre": "Pan integral",
        "precio": 1500,
        "stock": 20
    }
}
```

Respuesta de error:

```json
{
    "success": false,
    "message": "El producto no existe."
}
```

Estados de error: 400 para datos o JSON invalidos, 404 para productos o rutas
inexistentes, 409 para codigos duplicados, 413 para cuerpos mayores a 100 KB,
415 para codificaciones no soportadas y 500 para errores internos.
El middleware no expone detalles internos al cliente.

El array comienza vacio. Los datos se pierden al reiniciar el servidor;
no se usa base de datos ni almacenamiento en archivos.
Solo Producto tiene CRUD en esta entrega; los otros modelos se conservan.