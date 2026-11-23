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
| pages | Catalogo, detalle, alta/edicion y pagina no encontrada |
| services | Unico lugar con fetch, URL, metodos HTTP y procesamiento de errores |
| utils | Validacion, conversion, moneda y carga cancelable de recursos |
| styles | Estilos compartidos y adaptacion a celular |

`App.jsx` contiene solo las rutas y `main.jsx` inicializa React y los providers.
Los archivos externos a `src` son configuracion, dependencias y entrada HTML.

## Funcionalidades y accesibilidad

- CRUD completo integrado con `/products` y `/products/:codigo`.
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

La estetica se adapto a las referencias visuales compartidas por la usuaria:
fondo marfil, superficies claras, tinta oliva, acentos terracota y tipografia
editorial DM Serif Display combinada con DM Sans para los controles.
La cabecera horizontal, las tarjetas y el mosaico fotografico del catalogo vacio
mantienen la identidad Las Moras. Acentos coral y verde aportan contraste;
formularios, notificaciones y dialogos comparten la misma paleta.
El estado vacio no muestra filtros ni contadores sin informacion.
Se conserva el flujo de gestion y el CRUD de la API sin agregar secciones
comerciales, productos ni datos del negocio ficticios.
Las fotografias son ilustrativas, no del establecimiento real ni de productos
de la API. Las tarjetas muestran exclusivamente los datos reales del backend.