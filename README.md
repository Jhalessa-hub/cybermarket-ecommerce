# CyberMarket

Demo académica de e-commerce de PC. **Estado: Fases 1–6 implementadas**.
Disponibles: navegación por rol, perfil, catálogo, carrito, checkout, Mis Compras, seguimiento visual
y panel Admin con dashboard, productos, logística y consulta de clientes. Todo funciona localmente.

## Ejecutar

Requiere Node.js 22.12+ (o 24/26) y npm.

```powershell
npm install
npm run dev
npm test
npm run build
```

Abrir la URL local que imprime Vite. La página inicial muestra el catálogo de 80 modelos.
El servidor usa el puerto 5173 con `strictPort`: si está ocupado, informa el error en vez de abrir
otro puerto con una base de navegador distinta. Usa la **misma URL exacta y el mismo perfil de
navegador** al alternar Cliente y Admin; `localhost` y `127.0.0.1` no comparten `localStorage`.

## Catálogo y carrito (Fase 3)

- Inicio `/` es una portada con hero, categorías horizontales y cuadrícula de 4 columnas en
  escritorio/5 en pantallas amplias, sin barra lateral. «Filtrar catálogo» abre `/catalog`.
- El buscador principal de la navegación abre `/search` al interactuar, sin perder foco de escritura.
  `/search` y `/catalog` muestran filtros laterales; en móvil se pueden desplegar para no ocultar
  los resultados. Inicio vuelve a mostrar la portada limpia.
- Filtros laterales por texto, categoría, marca, rango de precio USD, disponibilidad y atributos
  técnicos. AND entre criterios y OR dentro de cada selección múltiple; chips permiten quitar un
  criterio sin borrar los restantes. Orden por precio/nombre y botón para ver más productos.
- Búsqueda, filtros y orden se conservan en parámetros URL: recarga, enlaces y Atrás restauran los
  criterios. Se mantienen detalle, carrito, sesión e imágenes sin reiniciar datos del navegador.
- Cards minimalistas: imagen grande, título y precio debajo, sin promociones. Stock verde cuando
  está disponible, naranja de 1 a 4 unidades y rojo cuando está agotado.
- `/products/:productId` abre un detalle enlazable con specs. Desde una card abre modal sin perder
  los filtros. Cierra con Escape/botón/fondo y devuelve foco; bloquea scroll del fondo.
- Los 80 modelos tienen fotos de producto locales en `public/images/catalog/products/`.
  `src/data/catalogPhotos.json` registra modelo, fuente, variante, URL original y hash de cada archivo.
  Se verificaron las páginas de fabricantes y, para algunos CPU, TechPowerUp. Las GPU NVIDIA
  muestran variantes MSI VENTUS, identificadas en el detalle. Los equipos son familias comerciales:
  su aspecto/configuración puede variar. Las fuentes se enlazan desde el detalle del producto.
- Las fotos se resuelven por ID y nombre exactos sin migrar ni borrar datos del navegador.
  Una imagen personalizada tiene prioridad. Ante ausencia o error se conserva la ilustración de
  categoría, marcada como “Imagen referencial”. No se requieren conexiones externas para cargarlas.
- Las imágenes y marcas pertenecen a sus respectivos titulares. Su procedencia no implica licencia
  abierta ni afiliación; antes de publicar o redistribuir esta demo se deben obtener los permisos
  correspondientes o sustituir los archivos. Más información en `public/images/catalog/SOURCES.md`.
- Añadir un producto actualiza el contador sin abrir el carrito ni emitir toast de éxito. El icono
  abre un drawer derecho con cantidades, eliminación, subtotales y total estimado. `/cart` también
  permite abrirlo directamente.
- El carrito se guarda por navegador, no por cuenta; se conserva al iniciar/cerrar sesión y al
  recargar. No se descuenta inventario al añadir: eso corresponde al checkout de Fase 4.
- Las cantidades no pueden exceder stock. Cuando el catálogo cambia, se ajustan las cantidades o
  se retiran artículos no disponibles, se persiste la corrección y se avisa sin abrir el drawer.
- El CTA abre el checkout protegido para Cliente. Carrito vacío o cálculo inválido impiden continuar.
- `productService` incluye consultas y CRUD protegido por rol Admin. Desactivar productos conserva
  sus referencias históricas y los datos snapshot de las compras.

## Checkout y confirmación (Fase 4)

- `/checkout`: una página con resumen de artículos/precios vigentes y pasos de dirección y pago.
  En escritorio el resumen queda a la derecha; en móvil aparece primero, antes de confirmar.
- Se elige una dirección de la libreta o se añade/edita sin salir. Si no hay direcciones, se abre
  el formulario. El teléfono de contacto también se puede guardar aquí y es obligatorio para envío.
  No se puede avanzar al pago sin teléfono válido y dirección guardada/confirmada.
- Confirmación explícita mediante casilla y botón «Confirmar y pagar». Aviso visible y discreto
  de pago simulado: no se piden tarjetas, CVV, PIN ni credenciales bancarias ni se conecta una pasarela.
- `orderService` revalida sesión Cliente, carrito, dirección, precios y stock contra los datos
  guardados. Los cambios requieren revisar el resumen de nuevo. No se inventan cargos adicionales.
- Orders y descuento de inventario se guardan en una sola escritura del documento DB. Cada orden
  tiene UUID, fecha, líneas/precios y dirección snapshot, moneda USD y estado inicial **Pendiente**.
  No se marca Pagado automáticamente: el operador Admin gestiona los estados desde Logística.
- El carrito se vacía después de guardar el pedido. Un token por revisión permite reintentar sin
  duplicar la orden ni borrar un carrito posterior. Los carritos anteriores conservan sus artículos
  y reciben un token local al leerse; no se resetea la base ni la sesión.
- Si falla la escritura del pedido, el carrito se conserva. Si el pedido se guardó pero falla la
  limpieza del carrito (otra clave), aparece un aviso específico; al reintentar o recargar se usa
  el recibo de la orden para terminar la limpieza sin descontar stock otra vez.
- `/checkout/confirmation/:orderId`: confirmación privada con ID, fecha, artículos, total y dirección;
  accesos «Seguir comprando» e «Ir a Mis Compras».
  Una confirmación ajena o inexistente muestra la misma respuesta genérica de no encontrado.
- Recorrido manual: añadir artículos disponibles → continuar al checkout → iniciar sesión/registrarse
  → guardar/elegir dirección → continuar al pago → revisar y aceptar → confirmar. Recargar la
  confirmación conserva el pedido y el carrito vacío. No se envían correos ni paquetes reales.

## Mis Compras y seguimiento (Fase 5)

- `/my-orders`: tarjetas minimalistas de los pedidos del Cliente activo, más nuevos primero;
  fecha, identificador, miniaturas, total, estado y enlace «Ver seguimiento». Sin compras, ofrece
  volver a la tienda. Los errores de carga no se presentan como historial vacío.
- `/my-orders/:orderId`: seguimiento arriba y resumen de artículos/precios/dirección snapshot debajo.
  Los cambios posteriores del catálogo o perfil no reescriben los datos de la compra.
- Línea vertical en escritorio y móvil: estado actual arriba en verde, avances anteriores debajo
  en gris, del más reciente al más antiguo. Los textos «Estado actual» y «Completado», iconos,
  `aria-current` y un anuncio accesible evitan depender solo del color. El timeline admite foco
  de teclado. Las etapas futuras se muestran por separado, nunca como eventos realizados.
- La secuencia de negocio sigue siendo Pendiente → Pagado → Enviado → Entregado. Cancelado aparece
  en rojo y detiene el proceso; Incidencia aparece en naranja y lo pausa. Se muestran descripciones
  de eventos cuando existen. No se completa una entrega al cancelar o registrar una incidencia.
- Se usan los eventos locales `{ status, createdAt, description? }`. Para pedidos anteriores sin
  historial se muestran las etapas implícitas del estado normal, sin inventar fechas: «Fecha no
  registrada». Las incidencias/cancelaciones no implican etapas anteriores no registradas.
- `orderService.listCustomerOrders()` y `getCustomerOrder(id)` comprueban la sesión Cliente; la
  identidad no se acepta desde un formulario. Pedido ajeno e inexistente tienen la misma respuesta.
  Cambiar cuenta retira inmediatamente los pedidos de la identidad anterior.
- `ShopContext` usa estas mismas reglas y recibe los cambios del repositorio, incluido `storage`
  entre pestañas del mismo origen. El historial y el detalle abierto se actualizan sin recargar.
- No hay controles de cambio de estado para Cliente ni avance automático por tiempo. Los pedidos
  nuevos permanecen Pendientes hasta que Admin los actualice desde Logística.
  No hay integración con transportistas, fechas de entrega inventadas ni cobros reales.
- Comprobación manual: completar checkout → «Ir a Mis Compras» → «Ver seguimiento». Recargar
  conserva la compra y sus datos originales. En las pruebas se verifican todos los estados y una
  actualización nativa desde otra pestaña, con datos de prueba en un perfil de navegador aislado.

## Panel Admin (Fase 6)

Acceso por `/login` con **`admin@cybermarket.com` / `admin123`**, exclusivamente de demostración.
La interfaz Cliente no muestra navegación ni herramientas Admin. Rutas, consultas privadas y cada
mutación comprueban el rol; un servicio ya creado pierde permiso después del logout.

- `/admin`: tarjetas de productos activos, stock bajo, pedidos registrados, clientes y ventas
  simuladas; distribución de pedidos por estado y lista de inventario que necesita atención.
  Periodo: **todo el historial local**. Ventas = suma de pedidos no cancelados, incluidos Pendiente
  e Incidencia; no representa ingresos cobrados. Solo productos activos cuentan para alertas 0–4.
  Sin registros se muestran ceros reales y mensajes vacíos, nunca actividad inventada.
- El dashboard también muestra las unidades totales en inventario, el origen y la revisión de la
  base consultada, y un botón «Actualizar datos». Relee los registros al entrar; no mantiene una
  colección distinta por cuenta. Cada compra confirmada aumenta pedidos/ventas y reduce las unidades.
  La cantidad de Clientes aumenta al registrar una cuenta, no con cada compra del mismo Cliente.
- `/admin/products`: búsqueda, filtros de inventario/visibilidad y tabla con miniatura, nombre,
  categoría, precio, stock, estado y acciones. Se muestran 20 filas inicialmente, con «Mostrar más».
  Stock 1–4 en naranja y 0 en rojo, acompañados de iconos/textos. Tablas desplazables y enfocables.
- Alta y edición en panel lateral accesible: nombre, marca, categoría, descripción, USD, unidades,
  imagen local/HTTPS y atributos técnicos opcionales por categoría. Cambiar categoría limpia los
  atributos del formulario antes de guardar. Precio no negativo con hasta dos decimales y stock
  entero no negativo. Los atributos existentes no editados y las imágenes personalizadas se conservan.
- Desactivación lógica con confirmación, sin borrar productos referenciados por pedidos. Se puede
  reactivar desde edición. Un formulario antiguo no puede sobrescribir cambios de precio/inventario
  ocurridos desde que se abrió: debe cerrarse y volver a abrirse con los datos actuales.
- `/admin/logistics`: búsqueda por ID/Cliente/email, filtro por estado, fecha, total y último cambio.
  «Gestionar» abre seguimiento, datos snapshot y selector con solo transiciones permitidas.
  Todo cambio exige confirmación; Cancelado e Incidencia requieren motivo (máximo 1000 caracteres).
- Transiciones normales: Pendiente → Pagado → Enviado → Entregado. Desde Pendiente/Pagado/Enviado
  se puede cancelar o registrar incidencia. Una incidencia permite retomar el último estado normal
  conocido o cancelar; no permite saltar al final. Entregado y Cancelado son terminales.
  Cancelar **no** repone stock ni ejecuta reembolsos: esas reglas están fuera del alcance actual.
- Cada cambio guarda fecha, actor Admin, estado anterior/nuevo, motivo/nota y revisión. La nota es
  visible al Cliente: no introducir información sensible. La revisión impide confirmar dos veces
  o aplicar un cambio desde una vista obsoleta. Los campos adicionales son compatibles con órdenes
  anteriores; no se restablece ni cambia la versión de la base.
- `/admin/customers`: consulta por nombre/email/teléfono, con fecha de alta y cantidad de pedidos.
  La proyección de datos es una lista explícita de columnas permitidas: no incluye credenciales,
  contraseñas, secretos ni direcciones. No hay edición, bloqueo o eliminación de clientes.
- Las escrituras notifican a Contexts y vistas locales sin recargar. Un fallo no produce un toast
  de éxito. La identidad es independiente por pestaña; persisten los límites de concurrencia de `localStorage`.

### Recorrido completo de verificación

1. Crear una cuenta Cliente y comprar artículos disponibles mediante checkout.
2. Consultar «Mis Compras» y abrir el seguimiento; mantener esta pestaña como Cliente.
3. Abrir `/admin` en otra pestaña normal del mismo origen y perfil; entrar con
   `admin@cybermarket.com` / `admin123`.
4. En Logística, buscar el pedido y confirmar Pagado, Enviado y Entregado; comprobar que el
   seguimiento del Cliente cambia sin recargar.
5. Como Admin, editar precio/stock o desactivar un producto; comprobar la tienda abierta sin
   recargar y que los datos históricos de las compras no cambien.
6. Cerrar sesión Admin y recargar la pestaña Cliente: debe seguir autenticada como Cliente.

Cada pestaña mantiene su propia Session; Cliente y Admin pueden operar simultáneamente.
No se añaden pedidos/clientes de prueba a la base del usuario. Las pruebas visuales usan un perfil
aislado con fixtures; la demo inicial continúa sin clientes ni pedidos inventados.
También se prueba el recorrido completo desde registro y compra reales de la interfaz, sin
precargar órdenes: compra Cliente → Admin en otra pestaña → ventas/stock/clientes/logística →
seguimiento y catálogo Cliente actualizados sin recarga → logout Admin sin afectar al Cliente.

## Navegación y perfil (Fase 2)

- `/login`: Email/Password; `/register`: Nombre/Email/Password, siempre como Cliente.
- `/profile`: nombre, teléfono, foto opcional y libreta de direcciones del Cliente activo.
- Navbar oscuro con círculo de perfil + primer nombre. “Enviar a…” usa dos líneas y no tiene fondo
  amarillo. El selector abre un diálogo nativo accesible y actualiza el destino sin recargar.
- Foto local JPG/PNG/WebP hasta 2 MB, recortada a 160×160 y preparada en el navegador. No se sube
  a un servidor; se guarda solo al pulsar “Guardar perfil”. Se puede quitar la foto.
- Dirección predeterminada y dirección seleccionada se conservan por Cliente. Editar/eliminar solo
  actúa en su propia libreta y no cambia snapshots de pedidos previos.
- `/checkout`, `/my-orders` y el detalle de pedidos exigen Cliente; el retorno de login/registro
  conserva el carrito y solo acepta rutas internas conocidas.
- `/admin`, `/admin/products`, `/admin/logistics`, `/admin/customers` exigen Admin incluso con URL
  directa. Sin Admin en esa pestaña redirigen a `/login?mode=admin`, incluso si allí hay un Cliente
  autenticado; el cambio de cuenta afecta solo a esa pestaña. La navegación Admin está ausente del DOM Cliente/visitante; sus servicios también validan
  permisos antes de leer información privada o guardar cambios.
- El layout prioriza escritorio y se adapta de forma sencilla a anchos estrechos, sin barra inferior.

## Base implementada

- React/Vite, TailwindCSS 3, React Router DOM y Lucide React.
- Tema oscuro con acentos amarillo/naranja vivos (sin copiar marcas).
- 80 modelos reales: 24 GPU NVIDIA/AMD, 24 CPU AMD/Intel, 24 placas madre ASUS/MSI/Gigabyte/ASRock
  y 8 familias de PC ensambladas Dell/Alienware/HP/Lenovo/MSI/ASUS.
- Precios referenciales **USD**, inventario ficticio y sin imágenes remotas. Los equipos ensamblados
  son familias de modelo; su configuración depende del SKU y no se inventan especificaciones.
- Repositorio local validado/versionado, suscripción en la pestaña actual y evento `storage` entre
  pestañas del mismo origen. No hay backend ni sincronización entre dispositivos.
- `AuthContext`, `ShopContext` y hooks comparten datos reactivos; `cartService` gestiona operaciones
  mediante `localDatabase.updateCart` y `storage/localCart.js`, nunca desde componentes.
- Registro y login en capa de servicio, credenciales Cliente derivadas con PBKDF2-SHA256 y salt
  aleatorio. Contraseñas de demo de 8 a 128 caracteres. Admin predefinido:
  `admin@cybermarket.com` / `admin123`.

## Persistencia y límites

`cybermarket:db:v1` es el documento canónico compartido de Products, Categories, Customers y Orders.
Su campo legado `Session` siempre se persiste como `null`. Orders e inventario se guardan juntos
para evitar escrituras parciales. `cybermarket_customers`, `cybermarket_products` y
`cybermarket_orders` son proyecciones de compatibilidad en `localStorage`, no fuentes transaccionales
alternativas; sus eventos `storage` también refrescan las vistas. Si aún no existe el documento
canónico, se importan esas colecciones tras validarlas, sin sobrescribir datos corruptos.

La identidad activa se guarda únicamente como `cybermarket_session` en `sessionStorage`. Cada
pestaña conserva su login al recargar; iniciar/cerrar sesión no cambia otras pestañas. Al cerrar
la pestaña termina su sesión. Duplicar una pestaña puede copiar inicialmente su `sessionStorage`,
pero los cambios posteriores siguen siendo independientes. La migración retira la Session compartida
antigua sin heredar su identidad ni borrar clientes/pedidos: puede requerir iniciar sesión una vez
en cada pestaña.

La base se revalida al recibir `storage`, recuperar foco/visibilidad, volver mediante `pageshow`
o reconectar una suscripción. Instancias de repositorio del mismo documento se notifican mediante
un evento local después de guardar; el evento nativo `storage` no cubre ese caso. Una lectura sin
cambios conserva el snapshot para no generar bucles de render. Nada de esto borra ni repuebla datos.

No hay sincronización entre orígenes (host/puerto), perfiles, ventanas privadas o navegadores.
Si una compra no aparece en Admin, compara el origen visible en el dashboard con la URL de compra
y utiliza el mismo perfil. Los registros de otro origen no se fusionan ni se eliminan automáticamente.

`cybermarket:cart:v1` contiene el carrito local independiente. La aplicación no borra datos corruptos
ni sobrescribe esquemas desconocidos automáticamente: bloquea escrituras y permite reintentar. La
capa de datos tiene recuperación explícita con confirmación y respaldo, sin restablecimiento
automático desde UI. Solo se migra el envelope v0 conocido con las mismas tablas.

Las escrituras publican éxito únicamente después de persistir. `localStorage` no ofrece
transacciones multipestaña: las escrituras concurrentes pueden competir, aunque se relee el último
snapshot antes de cada mutación. Auth/roles del cliente son demostrativos y manipulables desde el
navegador; PBKDF2 **no transforma esta demo en autenticación de producción**. No utilices datos
personales ni contraseñas reales. No hay cobros reales ni captura de datos bancarios.

Pruebas con Vitest, jsdom y Testing Library (solo dependencias de desarrollo). Cubren persistencia,
errores, migración, seeds, credenciales, sesión, autorización, reactividad de los providers, rutas,
formularios de acceso/perfil, selección de direcciones, filtros acumulativos, carrito, totales,
límites de stock, modal accesible, checkout, reintentos sin duplicados, snapshots de pedido,
aislamiento de pedidos por Cliente, estados del timeline, fechas ausentes, actualizaciones del
repositorio/entre pestañas, CRUD Admin, stock 4/5/0, transiciones y recuperación de incidencias,
consultas seguras de clientes, métricas y recuperación ante fallos de guardado/limpieza.
