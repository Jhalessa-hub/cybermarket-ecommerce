# Feature Specification: CyberMarket E-commerce

**Feature Branch**: `001-cybermarket-ecommerce`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: Crear CyberMarket como tienda de computadoras ensambladas y componentes para PC, con experiencias separadas de Cliente y Admin, autenticación, compra simulada, seguimiento y gestión administrativa.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar catálogo de PC (Priority: P1)

Como visitante, quiero explorar computadoras ensambladas y componentes de PC para encontrar productos apropiados para comprar.

**Why this priority**: El catálogo especializado es la propuesta central de CyberMarket y la entrada al flujo de compra.

**Independent Test**: Verificar que un visitante pueda navegar el catálogo, abrir productos y filtrar/buscar sin iniciar sesión.

**Acceptance Scenarios**:

1. **Given** que hay productos activos de computadoras y componentes, **When** el visitante abre la tienda, **Then** ve productos con nombre, imagen, precio, categoría y disponibilidad.
2. **Given** que el catálogo contiene varias categorías, **When** el visitante selecciona una categoría o aplica búsqueda/filtros, **Then** solo se muestran productos coincidentes y puede limpiar los filtros.
3. **Given** que una búsqueda no coincide con productos, **When** se muestran los resultados, **Then** aparece un estado vacío comprensible y una acción para limpiar la búsqueda.

---

### User Story 2 - Crear cuenta e iniciar sesión (Priority: P1)

Como cliente, quiero registrarme e iniciar sesión para gestionar mi perfil, carrito y compras. El checkout requiere una cuenta; no se permite completar compras como invitado.

**Why this priority**: La identidad del cliente vincula pedidos, direcciones, teléfono y seguimiento sin permitir pedidos anónimos.

**Independent Test**: Crear una cuenta, cerrar sesión e iniciar sesión de nuevo; comprobar que un visitante no puede finalizar una compra.

**Acceptance Scenarios**:

1. **Given** que una persona visitante elige crear cuenta con datos válidos, **When** envía el formulario, **Then** se crea una cuenta de cliente y se inicia su sesión.
2. **Given** que un visitante intenta acceder al checkout, **When** solicita continuar con la compra, **Then** se le pide iniciar sesión o crear una cuenta y se conserva el carrito.
3. **Given** que se envían credenciales inválidas, **When** se intenta iniciar sesión, **Then** el acceso se rechaza con un mensaje claro sin revelar información sensible.
4. **Given** una sesión activa, **When** el cliente cierra sesión, **Then** vuelve al estado de visitante y no puede acceder a las vistas privadas del cliente.

---

### User Story 3 - Comprar productos (Priority: P1)

Como cliente autenticado, quiero gestionar mi carrito y completar un checkout simulado para generar un pedido.

**Why this priority**: El flujo de compra convierte la navegación del catálogo en un pedido demostrable de principio a fin.

**Independent Test**: Añadir productos disponibles al carrito, cambiar cantidades y completar el checkout; comprobar la creación del pedido y el vaciado del carrito.

**Acceptance Scenarios**:

1. **Given** un cliente autenticado y un producto disponible, **When** lo añade al carrito, **Then** aparece en el carrito con precio, cantidad y subtotal correctos.
2. **Given** un carrito con productos, **When** el cliente cambia cantidades o elimina un producto, **Then** los importes y el contenido se actualizan correctamente.
3. **Given** que el cliente no tiene dirección registrada, **When** inicia checkout, **Then** puede añadir una dirección y teléfono requeridos para el pedido.
4. **Given** un carrito válido y datos de envío completos, **When** confirma la compra simulada, **Then** se crea un pedido con identificador, líneas, importes, dirección y estado inicial; no se solicitan ni procesan datos de pago reales.
5. **Given** que el carrito está vacío o un producto deja de estar disponible, **When** el cliente intenta confirmar el pedido, **Then** se impide la compra y se explica cómo resolver el problema.

---

### User Story 4 - Consultar perfil y seguimiento (Priority: P2)

Como cliente autenticado, quiero gestionar mis datos de contacto y direcciones, y consultar el estado de mis pedidos.

**Why this priority**: La gestión de perfil permite completar pedidos y el tracking demuestra el ciclo posterior a la compra.

**Independent Test**: Guardar y editar una dirección y teléfono; consultar un pedido y comprobar el timeline según su estado.

**Acceptance Scenarios**:

1. **Given** un cliente autenticado, **When** añade o modifica teléfono y direcciones, **Then** los cambios quedan asociados a su perfil y están disponibles para futuras compras.
2. **Given** pedidos de un cliente, **When** abre Mis Compras, **Then** solo ve sus propios pedidos, con fecha, identificador, total y estado actual.
3. **Given** un pedido en estado normal de envío, **When** el cliente abre su detalle, **Then** ve el timeline recomendado: Pedido recibido → Preparando → Enviado → En reparto → Entregado, con etapas anteriores completadas y la etapa actual destacada.
4. **Given** un pedido cancelado o con incidencia, **When** el cliente consulta su detalle, **Then** se muestra el estado alternativo claramente y no se presenta como una progresión normal hacia Entregado.

---

### User Story 5 - Administrar tienda y pedidos (Priority: P2)

Como administrador, quiero gestionar productos, clientes y estados de envío, además de consultar métricas para operar la tienda.

**Why this priority**: La gestión administrativa hace posible mantener un catálogo coherente y demostrar capacidades Admin separadas de Cliente.

**Independent Test**: Iniciar sesión con credenciales Admin, crear/editar/desactivar un producto, actualizar el estado de un pedido y verificar reflejo en Mis Compras y métricas.

**Acceptance Scenarios**:

1. **Given** que una persona no está autenticada como Admin, **When** navega la interfaz, **Then** no ve la opción Admin y no puede abrir vistas ni ejecutar operaciones administrativas.
2. **Given** las credenciales predefinidas `admin@cybermarket.com` / `admin123`, **When** se inicia sesión como Admin, **Then** se habilita el área administrativa y su navegación exclusiva.
3. **Given** un Admin autenticado, **When** crea o edita un producto, **Then** el catálogo refleja los cambios y valida los campos requeridos.
4. **Given** un producto con cuatro unidades o menos, **When** el Admin abre la gestión de productos o dashboard, **Then** se identifica como alerta de stock bajo.
5. **Given** un Admin autenticado y un pedido existente, **When** actualiza su envío a una etapa válida, **Then** el nuevo estado se refleja en Mis Compras y en el timeline del cliente.
6. **Given** un Admin autenticado, **When** consulta clientes y métricas, **Then** puede revisar clientes y métricas derivadas de los datos locales disponibles sin exponer controles Admin al cliente.

---

### Edge Cases

- El cliente recarga o cierra el navegador con carrito o sesión activos; el comportamiento debe conservar únicamente datos locales válidos conforme a las reglas de sesión.
- Dos intentos de compra concurrentes o repetidos no deben crear pedidos duplicados desde una misma confirmación.
- El inventario cambia o llega a cero entre añadir un producto y confirmar el pedido.
- Se intenta asignar una cantidad cero, negativa o superior a las existencias disponibles.
- Los datos guardados están ausentes, malformados o pertenecen a una versión anterior; la aplicación debe fallar de forma segura y explicar las opciones disponibles.
- Un usuario modifica la URL para abrir una ruta privada o administrativa sin el rol requerido.
- Un pedido cambia a Cancelado o Incidencia desde una etapa intermedia; el timeline debe representar la excepción sin afirmar que fue entregado.
- No hay productos, pedidos, clientes o ventas para mostrar en una vista administrativa; se presenta un estado vacío en lugar de métricas engañosas.
- Una búsqueda incluye espacios, mayúsculas/minúsculas o caracteres sin coincidencia.

## Requirements *(mandatory)*

### Functional Requirements

#### Catálogo especializado

- **FR-001**: El sistema MUST ofrecer un catálogo inicial centrado en computadoras ensambladas y componentes para ensamblaje de PC, incluidos como mínimo placas madre, tarjetas gráficas y procesadores.
- **FR-002**: El sistema MUST permitir a visitantes y clientes consultar productos activos con nombre, descripción, categoría, precio, imagen y disponibilidad.
- **FR-003**: El sistema MUST permitir buscar productos por texto y filtrar por categoría, rango de precio y disponibilidad; MUST permitir limpiar los filtros.
- **FR-004**: El sistema MUST representar productos sin resultados, sin inventario y datos incompletos mediante estados claros.

#### Cuenta y roles

- **FR-005**: El sistema MUST permitir registrar cuentas de Cliente e iniciar y cerrar sesión.
- **FR-006**: El sistema MUST exigir una sesión de Cliente para completar checkout; MUST permitir explorar catálogo como visitante y conservar el carrito al solicitar autenticación.
- **FR-007**: El sistema MUST ocultar completamente la navegación y opciones Admin a usuarios Cliente y visitantes.
- **FR-008**: El sistema MUST restringir las vistas y operaciones Admin a la sesión Admin válida, además de ocultar su navegación.
- **FR-009**: El acceso Admin MUST utilizar las credenciales predefinidas `admin@cybermarket.com` / `admin123` y comunicarse como mecanismo de demostración local, no como autenticación de producción.
- **FR-010**: El sistema MUST impedir que una sesión Cliente acceda a pedidos, perfil o funciones administrativas de otra identidad.

#### Perfil, carrito y checkout

- **FR-011**: El sistema MUST permitir al Cliente añadir, editar y eliminar teléfono y direcciones de entrega.
- **FR-012**: El sistema MUST permitir añadir productos disponibles al carrito, cambiar cantidades y retirar productos.
- **FR-013**: El sistema MUST calcular subtotales y total de manera consistente y volver a validar disponibilidad al confirmar el pedido.
- **FR-014**: El sistema MUST permitir confirmar un pedido simulado solo con sesión de Cliente y datos de envío válidos.
- **FR-015**: El checkout MUST generar un pedido identificable con líneas de producto, cantidades, precios aplicados, total, dirección, fecha y estado inicial.
- **FR-016**: El checkout MUST indicar que la operación es simulada y MUST NOT solicitar ni almacenar credenciales de pago reales.

#### Pedidos y logística

- **FR-017**: El sistema MUST mostrar al Cliente únicamente sus pedidos en Mis Compras, con identificador, fecha, total y estado.
- **FR-018**: El timeline normal MUST contemplar Pedido recibido, Preparando, Enviado, En reparto y Entregado, mostrando progreso y estado actual.
- **FR-019**: El sistema MUST admitir Cancelado e Incidencia como estados alternativos y reflejarlos claramente en el pedido.
- **FR-020**: El Admin MUST poder actualizar el estado de envío de pedidos existentes y esos cambios MUST reflejarse en la vista del Cliente.
- **FR-021**: El sistema MUST mantener coherencia entre cantidades compradas y disponibilidad local, e impedir ventas por encima del inventario registrado.

#### Operación y métricas Admin

- **FR-022**: El Admin MUST poder crear, consultar, editar y desactivar productos con datos de catálogo e inventario.
- **FR-023**: El sistema MUST marcar como stock bajo los productos con cuatro unidades o menos y exponer esa alerta en el área administrativa.
- **FR-024**: El Admin MUST poder consultar los clientes registrados y la información necesaria para la demostración, sin controles de modificación no definidos.
- **FR-025**: El Admin MUST poder consultar métricas derivadas de productos, pedidos, clientes y ventas simuladas; las métricas MUST tener etiquetas y periodo/contexto comprensibles.
- **FR-026**: Las vistas administrativas MUST presentar estados vacíos explícitos cuando no haya datos para calcular una métrica.

#### Datos, seguridad y calidad de experiencia

- **FR-027**: El sistema MUST persistir localmente las entidades Products, Categories, Customers, Orders y Session, preservando sus relaciones.
- **FR-028**: El sistema MUST validar entradas de usuario antes de guardar perfiles, productos, cantidades, pedidos o cambios de estado.
- **FR-029**: El sistema MUST manejar datos locales corruptos o no compatibles sin afirmar que se guardaron cambios que no se conservaron.
- **FR-030**: La experiencia MUST incluir estados de carga, vacío y error donde sean aplicables y MUST permitir navegación accesible por teclado.
- **FR-031**: El sistema MUST mantener los datos en el alcance de una demostración local; no MUST recopilar datos reales de pago ni presentar el tracking como integración con transportistas reales.

### Key Entities *(include if feature involves data)*

- **Product**: Producto vendible con nombre, descripción, categoría, precio, inventario, imagen, estado y atributos relevantes para equipo de PC.
- **Category**: Agrupación de catálogo; inicialmente incluye computadoras ensambladas y componentes (por ejemplo, placas madre, tarjetas gráficas y procesadores).
- **Customer**: Cuenta de cliente con datos de acceso de demostración, teléfono y una o más direcciones.
- **Session**: Identidad y rol activos (Cliente o Admin) necesarios para restringir vistas y acciones.
- **Cart**: Selección temporal de productos y cantidades asociada al cliente o visitante; se convierte en pedido solo tras checkout autenticado.
- **Order**: Compra simulada con cliente, líneas, precios aplicados, total, dirección, fecha, identificador y estado logístico.
- **Order Line**: Relación entre un pedido y un producto con cantidad y precio al momento de compra.
- **Shipping Status**: Estado normal del timeline o estado alternativo Cancelado/Incidencia asociado a un pedido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una evaluación funcional, al menos el 95% de participantes puede localizar una computadora o componente usando búsqueda o filtros en menos de 60 segundos.
- **SC-002**: El 100% de intentos de checkout sin sesión de Cliente queda detenido antes de crear un pedido; el carrito se conserva para continuar después de iniciar sesión.
- **SC-003**: Al menos el 90% de participantes de prueba completa el flujo de carrito y checkout simulado en menos de 3 minutos usando datos válidos.
- **SC-004**: El 100% de cambios de estado de envío realizados por Admin se refleja correctamente en el detalle del pedido del Cliente correspondiente.
- **SC-005**: El 100% de productos con inventario de 0 a 4 unidades se identifica como stock bajo y los productos con más de 4 unidades no generan esa alerta.
- **SC-006**: El 100% de rutas y operaciones Admin se mantiene inaccesible para sesiones de Cliente y visitantes, incluyendo intentos de acceso directo.
- **SC-007**: Al menos el 90% de participantes puede distinguir si un pedido está en curso, entregado o en estado de excepción usando el timeline sin asistencia.

## Assumptions

- El sistema es una demostración académica de e-commerce local; no ofrece pagos reales, seguridad de producción, operación multiusuario ni sincronización entre dispositivos.
- Los visitantes pueden navegar el catálogo y mantener un carrito temporal, pero deben crear cuenta o iniciar sesión para confirmar una compra.
- La cuenta Admin usa exactamente las credenciales predefinidas de la constitución y es una facilidad de demostración, no un secreto seguro.
- El umbral de stock bajo incluye cuatro unidades: se alerta cuando inventario es menor o igual a 4.
- El tracking es una representación local de estados operativos; no consulta transportistas externos.
- El catálogo de inicio se limita a computadoras ensambladas y componentes de PC, con categorías expandibles si se aprueban después.
- Las métricas se calculan a partir de los pedidos y registros locales disponibles; no se define analítica externa.
- El timeline recomendado es Pedido recibido → Preparando → Enviado → En reparto → Entregado, con Cancelado e Incidencia como excepciones.
