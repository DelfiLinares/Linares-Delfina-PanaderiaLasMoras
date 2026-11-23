# API Las Moras - Entrega 3

API REST de la panaderia con Express y persistencia temporal en memoria.
Incluye el CRUD de productos (Entrega 2) y la logica de venta: clientes, carrito,
pedidos y actualizacion de stock.
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

Variables opcionales del entorno: `PORT` (por defecto `3000`), `FRONTEND_URL`
(por defecto `http://localhost:5173`, origen permitido por CORS) y `CODIGO_EMPLEADO`
(por defecto `moras-empleados`, ver "Roles").
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

## Logica de venta (Entrega 3)

El cliente se identifica con su DNI (7 u 8 digitos, texto). No hay contrasenas:
"iniciar sesion" consiste en consultar `GET /clientes/:dni`.

| Metodo | Ruta | Operacion | Estado exitoso |
| --- | --- | --- | --- |
| POST | `/clientes` | Registrar cliente `{ dni, nombre, telefono }` | 201 |
| GET | `/clientes/:dni` | Consultar cliente (ingreso) | 200 |
| GET | `/carritos/:dni` | Ver carrito con items, subtotales, total y unidades | 200 |
| POST | `/carritos/:dni/items` | Agregar `{ codigo, cantidad }` (suma si ya existe) | 201 |
| PUT | `/carritos/:dni/items/:codigo` | Fijar la cantidad `{ cantidad }` | 200 |
| DELETE | `/carritos/:dni/items/:codigo` | Quitar un producto | 200 |
| DELETE | `/carritos/:dni` | Vaciar el carrito | 200 |
| POST | `/pedidos` | Confirmar la compra `{ dni }` | 201 |
| GET | `/pedidos?dni=` | Consultar los pedidos del cliente (mas nuevos primero) | 200 |
| POST | `/pedidos/:numero/cancelar` | Cancelar un pedido propio `{ dni }` | 200 |

## Roles: clientes y empleados

El sistema distingue dos roles y el backend hace cumplir las reglas, sin depender del frontend:

| Rol | Puede | No puede |
| --- | --- | --- |
| Visitante | Consultar el menu (`GET /products`) | Comprar ni administrar productos |
| Cliente | Consultar el menu, usar el carrito y los pedidos | Crear, editar ni eliminar productos (401) |
| Empleado | Crear, editar y eliminar productos | Comprar: carrito y pedidos responden 403 |

Un mismo DNI no puede ser cliente y empleado a la vez (409).

| Metodo | Ruta | Operacion | Estado exitoso |
| --- | --- | --- | --- |
| POST | `/empleados` | Registrar empleado `{ dni, nombre, cargo, codigo }` | 201 |
| POST | `/empleados/login` | Ingresar `{ dni, codigo }`; devuelve `{ empleado, token }` | 200 |
| GET | `/empleados/me` | Datos del empleado de la sesion (requiere token) | 200 |
| POST | `/empleados/logout` | Cerrar la sesion e invalidar el token (requiere token) | 200 |

`codigo` es el codigo de empleado que conoce la panaderia: se define con la variable de entorno
`CODIGO_EMPLEADO` (por defecto `moras-empleados`) y hace falta tanto para registrarse como para
ingresar. Un codigo incorrecto al registrarse devuelve 403 y al ingresar 401.

Las rutas `POST /products`, `PUT /products/:codigo` y `DELETE /products/:codigo` exigen el
encabezado `Authorization: Bearer <token>` del empleado; sin el, con un token invalido o cerrado
devuelven 401. Los clientes se identifican solo con su DNI, como antes. Las sesiones de empleado
viven en memoria y se pierden al reiniciar el servidor, igual que el resto de los datos.
Si se usa el DNI de un empleado en `/clientes`, `/carritos` o `/pedidos` se responde 403 con un
mensaje que explica que los empleados no pueden realizar compras.

El modelo `Empleado` se identifica por `dni` y tiene `nombre` y `cargo`.

Reglas de negocio:

- La cantidad debe ser un entero mayor o igual a 1 y nunca puede superar el stock
  disponible (409 con el nombre del producto y las unidades disponibles).
- Confirmar una compra valida todo el carrito antes de descontar: si falta stock en
  algun producto no se modifica nada. Si es correcto, descuenta el stock, guarda el
  pedido (con copia del nombre y precio de cada producto), calcula el total y vacia el carrito.
- Un carrito vacio no se puede confirmar (409).
- Cancelar un pedido (estado `cancelado`) repone el stock. Solo puede hacerlo el cliente
  que lo realizo y no se puede cancelar dos veces (409).
- Los errores usan el mismo formato y codigos que el CRUD: 400 datos invalidos,
  404 cliente, producto, item o pedido inexistente, 409 conflictos de stock o estado.

### Validaciones (se aplican siempre en el backend)

| Dato | Regla | Mensaje (400) |
| --- | --- | --- |
| `dni` | Texto de 7 u 8 digitos, sin puntos ni letras | `El DNI debe tener 7 u 8 digitos, sin puntos.` |
| `nombre` | Obligatorio, solo letras, espacios, `.`, `'` y `-`; hasta 120 caracteres | `El nombre es obligatorio, solo admite letras...` |
| `telefono` | Obligatorio, 6 a 20 caracteres entre numeros, espacios, `+`, `-` y parentesis | `El telefono debe tener entre 6 y 20 caracteres...` |
| `cantidad` | Numero entero mayor o igual a 1 (no acepta decimales ni textos) | `La cantidad debe ser un numero entero mayor o igual a 1.` |
| `numero` de pedido | Solo digitos | `El numero de pedido no es valido.` |
| Cuerpos JSON | No se aceptan campos de mas, cuerpos vacios ni que no sean un objeto | `Los datos enviados son invalidos.` |

Otras reglas: no se registran dos clientes con el mismo DNI (409); no se opera con clientes,
productos, items ni pedidos inexistentes (404); la cantidad en el carrito no puede superar el
stock (409); un carrito vacio no se confirma (409); un pedido cancelado no se vuelve a cancelar
(409) y solo lo cancela su dueno (404 para otro cliente). Si un producto se elimina, desaparece
de los carritos y los pedidos ya hechos conservan el nombre y precio de la compra.
El frontend replica las validaciones de formato para avisar antes de enviar, pero el
backend no depende de ellas.

Pedido devuelto:

```json
{
    "numero": 1,
    "fecha": "2026-11-23T16:19:00.000Z",
    "total": 6800,
    "cliente": { "dni": "40123456", "nombre": "Delfina Linares" },
    "empleado": null,
    "estado": "confirmado",
    "detalles": [
        { "producto": { "codigo": "P2", "nombre": "Pan de campo", "precio": 3200 }, "cantidad": 1, "subtotal": 3200 }
    ]
}
```

El modelo `Cliente` usa `dni` (segun el diagrama de clases) y `Pedido` incorpora
`estado` y los metodos `agregarProducto` y `calcularTotal`. `Empleado` no interviene
porque las compras las realiza el propio cliente desde la web.
Los carritos y pedidos tambien viven en memoria y se pierden al reiniciar.