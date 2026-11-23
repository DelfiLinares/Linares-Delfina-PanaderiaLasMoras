# Las Moras - Frontend React

## Iniciar

Requiere Node.js 20.19+ o 22.12+ y npm. Desde la raiz del repositorio,
ejecutar en dos terminales:

```sh
npm start --prefix backend
```

```sh
npm install --prefix frontend
npm run dev --prefix frontend
```

Abrir http://127.0.0.1:5173. El frontend se ejecuta como proyecto independiente.
Vite redirige `/api` a `http://localhost:3000` durante el desarrollo.
Si 5173 esta ocupado, usar `npm run dev --prefix frontend -- --port 5174`.

El catalogo obtiene los productos reales de la API. Comienza vacio porque el
backend almacena los registros en memoria; se pierden al reiniciarlo.
No se incluyen productos ficticios ni persistencia local alternativa.

## Compilar y verificar

```sh
npm test --prefix frontend
npm run build --prefix frontend
```

Para servir el build localmente, definir la URL real antes de compilar:

```powershell
$env:VITE_API_URL = 'http://localhost:3000'
npm run build --prefix frontend
```

Configurar el origen del frontend en la terminal del backend antes de iniciarlo:

```powershell
$env:FRONTEND_URL = 'http://127.0.0.1:4173'
npm start --prefix backend
```

En otra terminal ejecutar `npm run preview --prefix frontend`.
Para despliegue, definir `VITE_API_URL` antes del build, configurar `FRONTEND_URL`
en el backend y configurar el servidor estatico para devolver `index.html`
en las rutas de React. Nunca colocar secretos en variables `VITE_*`.

## Organizacion

Toda la implementacion de la aplicacion esta en `src`:

| Carpeta | Responsabilidad |
| --- | --- |
| assets | Fotografias locales y creditos |
| components | Layout, tarjetas, acciones compartidas, estado vacio, formulario, notificaciones y confirmacion |
| pages | Menu, catalogo, detalle, alta/edicion, cuenta, carrito, pedidos y pagina no encontrada |
| services | Unico lugar con fetch, URL, metodos HTTP y procesamiento de errores |
| utils | Validacion, conversion, moneda y carga cancelable de recursos |
| styles | Estilos compartidos y adaptacion a celular |

`App.jsx` contiene solo las rutas y `main.jsx` inicializa React y los providers.
Los archivos externos a `src` son configuracion, dependencias y entrada HTML.

## Funcionalidades y accesibilidad

- CRUD completo integrado con `/products` y `/products/:codigo` (solo empleados).
- Roles: el visitante solo ve el Home y el Menu; el cliente compra; el empleado administra los
  productos y no puede comprar. Las secciones no permitidas muestran un aviso y el backend
  rechaza las peticiones (401/403) aunque se intenten saltear la interfaz.
- Home (`/`) con portada, productos destacados y pasos para comprar.
- Menu (`/menu`) con todos los productos y sus precios; el cliente agrega al carrito y el empleado edita o agrega productos.
- Cuenta (`/cuenta`): registro e ingreso de clientes (DNI) y de empleados (DNI y codigo de empleado); la sesion se recuerda en `localStorage` y se valida contra el backend al abrir la app.
- Carrito (`/carrito`): cambiar cantidades, quitar productos, vaciar y confirmar la compra.
- Mis pedidos (`/pedidos`): historial de compras y cancelacion con reposicion de stock.
- El stock siempre lo valida y actualiza el backend; el frontend muestra sus mensajes de error.
- Busqueda, filtro por stock y ordenamiento de registros de la API.
- Vista de tarjetas por defecto y selector accesible para cambiar a lista.
- Estados de carga, catalogo vacio, sin resultados y errores con reintento.
- Validaciones alineadas con el backend; codigo inmutable durante la edicion.
- Notificaciones compartidas para errores y exitos, sin `alert()`.
- Confirmacion de eliminacion con dialogo nativo, foco contenido y tecla Escape.
- Labels asociados, errores vinculados a inputs, botones semanticos y texto alternativo.
- Enlace para saltar al contenido, foco visible y navegacion por teclado.
- Animaciones reducidas segun preferencias y tabla con desplazamiento en celular.

## Criterio de diseno

La estetica es calida: fondo crema, tonos mora y caramelo, bordes redondeados y
tipografia editorial DM Serif Display combinada con DM Sans para los controles.
La cabecera horizontal, las tarjetas y el mosaico fotografico del catalogo vacio
mantienen la identidad Las Moras; formularios, notificaciones y dialogos comparten la paleta.
El estado vacio no muestra filtros ni contadores sin informacion.
No se incluyen productos ni datos del negocio ficticios.
Las fotografias son ilustrativas, no del establecimiento real ni de productos
de la API. Las tarjetas muestran exclusivamente los datos reales del backend.