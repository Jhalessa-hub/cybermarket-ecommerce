# Tareas de implementación — E-commerce CyberMarket

Las tareas están ordenadas por dependencias y por las seis fases solicitadas. Cada tarea es una
unidad atómica con su archivo destino principal; no se debe marcar completa hasta que el cambio y
su validación correspondiente estén listos.

## Fase 1: Entorno, Contextos globales y Persistencia base

- [x] T001: Inicializar la aplicación React/Vite y configurar scripts de desarrollo y build en `package.json` y `vite.config.js`.
- [x] T002: Configurar TailwindCSS con tokens de tema oscuro tech-first y estilos base responsive en `tailwind.config.js` y `src/styles/index.css`.
- [x] T003: Instalar y configurar React Router DOM y Lucide React como dependencias de la aplicación en `package.json` y `src/app/App.jsx`.
- [x] T004: Crear el esquema versionado de la base local con tablas lógicas Products, Categories, Customers, Orders y Session en `src/services/storage/databaseSchema.js`.
- [x] T005: Crear datos semilla iniciales para computadoras ensambladas, placas madre, tarjetas gráficas y procesadores en `src/services/storage/seedData.js`.
- [x] T006: Implementar lectura, parseo, validación, escritura y migración segura del documento local en `src/services/storage/localDatabase.js`.
- [x] T007: Implementar suscripciones reactivas en la pestaña actual y escucha del evento `storage` entre pestañas en `src/services/storage/localDatabase.js`.
- [x] T008: Implementar validadores reutilizables para email, perfil, dirección, producto, inventario, carrito y pedido en `src/utils/validation.js`.
- [x] T009: Implementar registro Cliente, login/logout, verificación Admin predefinida y autorización de operaciones en `src/services/authService.js`.
- [x] T010: Implementar `AuthContext` con estados de inicialización, visitante, Cliente y Admin, sin persistir passwords en claro, en `src/context/AuthContext.jsx`.
- [x] T011: Implementar `ShopContext` para snapshot de catálogo, categorías, carrito y pedidos, conectado al repositorio local, en `src/context/ShopContext.jsx`.
- [x] T012: Implementar hooks `useAuth`, `useShop`, `useCart` y `useLocalDatabase` con estados de carga/error explícitos en `src/hooks/useAuth.js`, `src/hooks/useShop.js`, `src/hooks/useCart.js` y `src/hooks/useLocalDatabase.js`.
- [x] T013: Montar `AuthProvider` y `ShopProvider` en el orden de dependencias acordado y crear el punto de entrada de la aplicación en `src/app/providers.jsx` y `src/main.jsx`.
- [x] T014: Añadir pruebas unitarias de schema, seed, migración, datos corruptos, fallo de storage y publicación de cambios en `tests/unit/storage/`.
- [x] T015: Añadir pruebas de autenticación para registro solo Cliente, login/logout y credenciales Admin predefinidas en `tests/unit/auth/`.

## Fase 2: Layout dinámico y navegación por rol

- [x] T016: Definir rutas públicas, Cliente, Admin y rutas de fallback en `src/routes/routePaths.js`.
- [x] T017: Implementar guards de visitante/Cliente y Admin, con espera de hidratación y retorno interno seguro después del login, en `src/routes/PublicRoute.jsx`, `src/routes/CustomerRoute.jsx` y `src/routes/AdminRoute.jsx`.
- [x] T018: Registrar la matriz de rutas y páginas en `src/routes/AppRouter.jsx`.
- [x] T019: Crear shell general y layout Cliente responsive sin enlaces ni opciones Admin en `src/components/layout/AppShell.jsx` y `src/components/layout/CustomerLayout.jsx`.
- [x] T020: Crear layout Admin separado, montado únicamente dentro de una ruta protegida Admin, en `src/components/layout/AdminLayout.jsx`.
- [x] T021: Implementar navbar Cliente con navegación de tienda, perfil, compras, acceso al carrito y control “Enviar a…” vinculado a direcciones en `src/components/navigation/CustomerNavigation.jsx`.
- [x] T022: Implementar navegación Admin exclusiva para dashboard, productos, logística y clientes en `src/components/navigation/AdminNavigation.jsx`.
- [x] T023: Implementar selector “Enviar a…” que muestre dirección elegida, dirección predeterminada y acceso a añadir/editar direcciones en `src/components/profile/AddressBook.jsx`.
- [x] T024: Crear páginas de Login y Registro rápido con validación de Nombre/Email/Password y mensajes accesibles en `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`, `src/components/auth/LoginForm.jsx` y `src/components/auth/RegisterForm.jsx`.
- [x] T025: Crear página de perfil para editar teléfono, nombre y varias direcciones con validación en `src/pages/ProfilePage.jsx` y `src/components/profile/ProfileForm.jsx`.
- [x] T026: Añadir pruebas de rutas directas, visibilidad del navbar, protección de acciones y retorno a checkout en `tests/integration/routing/`.

## Fase 3: Módulo Tienda — Catálogo, filtros, detalle y carrito

- [x] T027: Implementar servicio de consulta y CRUD de productos/categorías con validación de categoría, precio e inventario en `src/services/productService.js`.
- [x] T028: Implementar hook de búsqueda y filtros acumulativos con lógica AND entre criterios y OR dentro de selecciones múltiples en `src/hooks/useCatalog.js`.
- [x] T029: Crear página responsive de tienda que conecte catálogo, búsqueda, filtros y estados de carga/error/vacío en `src/pages/StorePage.jsx`.
- [x] T030: Implementar filtros por texto, categoría, rango de precio, disponibilidad y atributos técnicos existentes en `src/components/catalog/CatalogFilters.jsx`.
- [x] T031: Implementar grid y cards con precio, disponibilidad, categoría e imagen alternativa cuando falte imagen en `src/components/catalog/ProductGrid.jsx` y `src/components/catalog/ProductCard.jsx`.
- [x] T032: Implementar modal de detalle con especificaciones técnicas por categoría, cierre con Escape, foco accesible y acción para añadir al carrito en `src/components/catalog/ProductDetailModal.jsx`.
- [x] T033: Implementar operaciones del carrito para agregar, actualizar cantidad, eliminar y recalcular importes en `src/services/cartService.js`.
- [x] T034: Implementar persistencia independiente del carrito en `cybermarket:cart:v1`, conservándolo como visitante y al autenticar, en `src/services/storage/localCart.js`.
- [x] T035: Implementar drawer lateral del carrito con líneas, subtotales, total, cantidad limitada por stock, estado vacío y CTA de checkout en `src/components/cart/CartDrawer.jsx` y `src/components/cart/CartLine.jsx`.
- [x] T036: Implementar mensajes/toasts de confirmación y errores de catálogo/carrito sin afirmar cambios que no se hayan persistido en `src/components/feedback/ToastRegion.jsx` y `src/utils/errorMessages.js`.
- [x] T037: Añadir pruebas unitarias de filtros acumulativos, límites de cantidad, cálculo de totales y persistencia del carrito en `tests/unit/catalog/` y `tests/unit/cart/`.
- [x] T038: Añadir pruebas de integración para búsqueda sin resultados, detalle con especificaciones faltantes, stock agotado y persistencia tras recarga en `tests/integration/shop/`.

## Fase 4: Checkout, pago simulado y registro de orden

- [x] T039: Implementar reglas de pedido, creación con ID único, snapshots de líneas/dirección, validación de stock y transiciones iniciales en `src/services/orderService.js`.
- [x] T040: Implementar confirmación de checkout que guarde Orders y ajuste de inventario en una sola escritura del snapshot local en `src/services/orderService.js`.
- [x] T041: Implementar página protegida de checkout con resumen de artículos, precios vigentes, dirección “Enviar a…” y manejo de retorno de autenticación en `src/pages/CheckoutPage.jsx`.
- [x] T042: Implementar resumen final de checkout con confirmación explícita, importes y aviso visible de que el pago es simulado en `src/components/cart/CheckoutSummary.jsx`.
- [x] T043: Excluir campos de tarjeta, CVV, PIN y credenciales bancarias de todos los formularios y del modelo persistido en `src/pages/CheckoutPage.jsx` y `src/services/orderService.js`.
- [x] T044: Vaciar únicamente el carrito confirmado después de guardar el pedido; conservarlo si hay fallo de inventario, dirección o persistencia en `src/services/orderService.js`.
- [x] T045: Implementar pantalla de confirmación con identificador del pedido y enlace a Mis Compras en `src/pages/OrderConfirmationPage.jsx`.
- [x] T046: Añadir pruebas de checkout autenticado, visitante redirigido con carrito conservado, pedido único, snapshot de dirección, stock insuficiente y fallo de storage en `tests/integration/checkout/`.

## Fase 5: Cliente — Mis Compras y tracking interactivo

- [x] T047: Implementar consulta de pedidos filtrada por identidad Cliente y ocultamiento de pedidos ajenos en `src/services/orderService.js`.
- [x] T048: Implementar página protegida Mis Compras con estados vacío, error y lista de pedidos en `src/pages/MyOrdersPage.jsx` y `src/components/orders/OrderList.jsx`.
- [x] T049: Implementar resumen de pedido con identificador, fecha, total, líneas y snapshot de dirección en `src/components/orders/OrderSummary.jsx`.
- [x] T050: Implementar página de detalle que devuelva estado no encontrado sin revelar si el pedido pertenece a otra cuenta en `src/pages/OrderDetailPage.jsx`.
- [x] T051: Implementar timeline gráfico accesible para Pendiente → Pagado → Enviado → Entregado, con Cancelado e Incidencia como estados alternativos, en `src/components/orders/OrderTimeline.jsx`.
- [x] T052: Conectar cambios del repositorio al timeline abierto para que una actualización local se refleje sin recargar ni depender de un transportista externo en `src/context/ShopContext.jsx` y `src/pages/OrderDetailPage.jsx`.
- [x] T053: Añadir pruebas de aislamiento de pedidos por Cliente, estado vacío, estados del timeline y accesibilidad sin depender solo del color en `tests/integration/orders/`.

## Fase 6: Panel Admin

- [x] T054: Implementar página de dashboard Admin con tarjetas de productos activos, stock bajo, pedidos por estado, clientes y ventas simuladas en `src/pages/admin/AdminDashboardPage.jsx` y `src/components/admin/MetricsDashboard.jsx`.
- [x] T055: Implementar cálculo de métricas a partir de datos locales, periodo/contexto visible y estado vacío sin cifras inventadas en `src/services/metricsService.js`.
- [x] T056: Implementar tabla de productos Admin con búsqueda, disponibilidad y alerta cuando stock sea menor o igual a 4 en `src/pages/admin/AdminProductsPage.jsx`, `src/components/admin/ProductTable.jsx` y `src/components/admin/LowStockAlert.jsx`.
- [x] T057: Implementar formulario reutilizable de alta/edición de producto con especificaciones de PC y validaciones de precio e inventario en `src/components/admin/ProductForm.jsx`.
- [x] T058: Implementar acciones Admin para crear, editar y desactivar productos; conservar snapshots de órdenes y reflejar cambios en tienda sin recarga en `src/services/productService.js` y `src/pages/admin/AdminProductsPage.jsx`.
- [x] T059: Implementar cola de pedidos del operador logístico con filtros por estado e identificación del pedido en `src/pages/admin/AdminLogisticsPage.jsx` y `src/components/admin/LogisticsQueue.jsx`.
- [x] T060: Implementar validación de transiciones Pendiente → Pagado → Enviado → Entregado y estados alternativos Cancelado/Incidencia en `src/services/orderService.js`.
- [x] T061: Implementar cambio de estado Admin con fecha/evento, confirmación y actualización inmediata en el timeline del Cliente en `src/pages/admin/AdminLogisticsPage.jsx` y `src/context/ShopContext.jsx`.
- [x] T062: Implementar tabla consultiva de Clientes con búsqueda y columnas permitidas, excluyendo contraseñas y secretos en `src/pages/admin/AdminCustomersPage.jsx` y `src/components/admin/CustomerTable.jsx`.
- [x] T063: Verificar que cada ruta y mutación Admin exige rol Admin y que no aparece interfaz Admin en navegación Cliente/visitante en `src/routes/AdminRoute.jsx` y `tests/integration/admin/`.
- [x] T064: Añadir pruebas de CRUD, límite de alerta de stock 4/5/0, transiciones válidas/inválidas, actualización reactiva, privacidad de Clientes y métricas vacías en `tests/integration/admin/`.

## Secuencia y dependencias

### Mejora posterior a las seis fases: separación de portada y búsqueda

- [x] T065: Separar entradas `Home.jsx` y `Catalog.jsx`, registrar `/search` y `/catalog`, y mantener detalle/carrito compartidos en `StorePage.jsx`.
- [x] T066: Crear hero y categorías horizontales; ampliar la cuadrícula de Inicio a 4–5 columnas sin filtros laterales en `StoreHero.jsx`, `ProductGrid.jsx` y `CustomerLayout.jsx`.
- [x] T067: Integrar buscador principal y accesos Inicio/Catálogo en `CustomerNavigation.jsx` y `CatalogSearch.jsx`, conservando foco de escritura y retornos internos seguros.
- [x] T068: Persistir criterios/orden en URL y limitar filtros a búsqueda/catálogo, con desplegable móvil, en `useCatalogLocation.js`, `catalogLocation.js` y `CatalogFilters.jsx`.
- [x] T069: Probar portada, navegación, restauración URL, foco y regresiones; actualizar especificación/README y verificar vistas responsive sin modificar la base local.

### Corrección: consistencia de compra y panel Admin

- [x] T070: Revalidar datos al recuperar foco/visibilidad, `pageshow` y reconectar suscripciones; notificar escrituras entre repositorios del mismo documento sin bucles ni reinicios de datos en `localDatabase.js`.
- [x] T071: Refrescar el dashboard al entrar, mostrar origen/revisión y unidades en inventario, añadir actualización manual y fijar el puerto de desarrollo sin cambio automático a otra base.
- [x] T072: Verificar desde registro/checkout reales que stock, ventas, Clientes, pedidos y estados llegan a Admin y vuelven al seguimiento Cliente; añadir pruebas de regresión y documentar los límites de origen/perfil.

### Ajuste: sesiones por pestaña y operación Cliente/Admin en paralelo

- [x] T073: Separar `cybermarket_session` en `sessionStorage` mediante `tabSession.js` y el snapshot efectivo de `localDatabase.js`; preservar autorización de servicios, recarga y rollback ante fallo de registro.
- [x] T074: Mantener datos compartidos y proyecciones `cybermarket_customers`, `cybermarket_products` y `cybermarket_orders`; escuchar sus eventos sin sustituir la sesión local y preservar el guardado canónico conjunto de Orders/inventario.
- [x] T075: Retirar Session compartida antigua sin heredar identidad ni borrar registros; importar colecciones validadas cuando falte la base canónica y bloquear colecciones corruptas sin sobrescribirlas.
- [x] T076: Redirigir `/admin` sin Admin local a `/login?mode=admin`, admitir Cliente en ese formulario y validar email Admin antes de autenticar, sin afectar otras pestañas.
- [x] T077: Añadir regresiones de roles paralelos, compra/stock/estado/precio reactivos, recarga, logout aislado, eventos, migración y fallos; validar recorrido real en dos pestañas normales.
- [x] T078: Alinear README, plan y módulo Auth con la constitución 2.0.0; ejecutar suite completa, build y auditoría de dependencias (198 pruebas aprobadas, build correcto y 0 vulnerabilidades).

### Dependencias de las seis fases

- La Fase 1 bloquea todas las demás fases: Contexts y servicios dependen del esquema y del
  repositorio local.
- La Fase 2 depende de AuthContext para calcular navegación y guards; debe estar lista antes de
  exponer páginas privadas.
- La Fase 3 depende de ShopContext y servicios de persistencia; la Fase 4 depende del carrito y de
  perfil/direcciones de las Fases 2–3.
- La Fase 5 depende de la creación de pedidos de la Fase 4.
- La Fase 6 depende de catálogo, clientes y pedidos; el dashboard se completa después de que
  existan datos reales locales.
- Las tareas de pruebas pueden desarrollarse en paralelo con UI/servicios cuando sus contratos y
  modelos estén definidos; no se debe paralelizar una mutación sobre el mismo contrato sin acordarlo.

## Estrategia de entrega

1. Completar Fase 1 y verificar persistencia, sesión y límites de roles antes de desarrollar
   funcionalidades visibles.
2. Completar Fase 2 y demostrar que Cliente/visitante no ven ni acceden a Admin.
3. Entregar catálogo y carrito navegables en Fase 3.
4. Cerrar un recorrido vertical de compra simulada en Fase 4 antes de construir historial.
5. Demostrar el ciclo de estado completo en Fase 5 y 6: pedido creado → Admin cambia estado →
   Cliente ve el tracking actualizado.
6. No habilitar pagos reales, servicios externos, sincronización entre dispositivos ni
   compatibilidad automática de PC; requieren una especificación y aprobación separadas.
