# Módulo 04 — Administración de catálogo, logística, clientes y métricas

## Propósito

Dar al rol Admin herramientas para operar la tienda de demostración, manteniendo todas las
funciones separadas de la experiencia Cliente y haciendo visibles los cambios pertinentes.

## Acceso y alcance

- Entrada solo mediante `admin@cybermarket.com` / `admin123`, según la constitución.
- El registro público nunca crea Admin.
- La autorización se verifica para rutas, lectura de datos y mutaciones; ocultar UI es una capa
  adicional, no el único control.
- “Tiempo real” significa reflejo inmediato de cambios en la interfaz local abierta, no una API,
  actualización multiusuario o notificación externa.

## Áreas funcionales

### 1. CRUD de productos

- Listar, buscar, crear, consultar, editar y desactivar productos.
- Campos básicos: nombre, descripción, categoría, precio, inventario, imagen y especificaciones
  técnicas de la categoría.
- Categorías de inicio enfocadas en computadoras ensambladas, placas madre, tarjetas gráficas y
  procesadores.
- Validación de precio no negativo, inventario entero no negativo, campos requeridos y categoría.
- Stock bajo si inventario **≤ 4**; cero unidades debe mostrarse también como agotado.
- La eliminación lógica/desactivación es preferida si el producto aparece en pedidos anteriores;
  los snapshots de órdenes no deben perderse.

### 2. Operador logístico

- Listar y buscar pedidos por ID, cliente o estado, con resumen de fecha e importe.
- Mostrar transiciones del ciclo: Pendiente → Pagado → Enviado → Entregado.
- Permitir Cancelado e Incidencia como estados alternativos.
- Al guardar un estado, actualizar de inmediato el tracking del Cliente en la aplicación local.
- No etiquetar el envío como integrado con transportista externo.

### 3. Gestión/tabla de clientes

- Tabla de clientes con búsqueda y datos pertinentes a la operación: nombre, email, teléfono,
  cantidad de pedidos y fecha de alta si existe.
- Consultar perfil/direcciones según el propósito de demo, sin mostrar passwords ni secretos.
- En el alcance inicial es consulta; edición/bloqueo de clientes no queda habilitada hasta que se
  defina un caso de uso y sus reglas de auditoría.

### 4. Dashboard de métricas

- Indicadores derivados de registros locales existentes: número de productos activos, unidades
  con stock bajo, pedidos por estado, clientes registrados y ventas simuladas.
- Periodo/contexto visible; ventas se calculan usando pedidos confirmados locales y no representan
  ingresos cobrados.
- Estado vacío cuando no haya registros; no mostrar cifras inventadas como si fueran datos reales.
- La alerta de stock bajo cuenta productos con inventario de 0 a 4; distinguir agotados (0) si el
  resumen lo permite.

## Requisitos funcionales

### Autorización Admin

- **ADMIN-FR-001**: El sistema MUST mostrar navegación y vistas Admin únicamente en sesión Admin.
- **ADMIN-FR-002**: El sistema MUST denegar acceso directo a rutas y acciones Admin a visitantes y
  clientes, aunque conozcan la URL.
- **ADMIN-FR-003**: El sistema MUST proteger cada mutación Admin y no depender únicamente de ocultar
  enlaces o botones.
- **ADMIN-FR-004**: Al cerrar sesión Admin, MUST invalidarse el contexto de rol para las vistas y
  operaciones siguientes.

### Productos e inventario

- **ADMIN-FR-005**: Admin MUST poder crear, leer, editar y desactivar productos.
- **ADMIN-FR-006**: El formulario de producto MUST incluir nombre, categoría, descripción, precio,
  inventario, imagen y specs relevantes para la categoría.
- **ADMIN-FR-007**: El sistema MUST validar datos antes de guardar y ofrecer errores accionables.
- **ADMIN-FR-008**: El sistema MUST marcar con stock bajo inventario menor o igual a cuatro unidades
  y distinguir producto agotado cuando inventario sea cero.
- **ADMIN-FR-009**: Desactivar un producto MUST retirarlo del catálogo de venta sin alterar las
  líneas históricas de pedidos existentes.
- **ADMIN-FR-010**: Los cambios confirmados de catálogo MUST reflejarse en la tienda sin recarga
  forzada del navegador.

### Operador logístico

- **ADMIN-FR-011**: Admin MUST consultar pedidos con filtros por estado y búsqueda por identificador.
- **ADMIN-FR-012**: Admin MUST poder cambiar un pedido por los estados normales Pendiente, Pagado,
  Enviado y Entregado según transiciones permitidas, o marcarlo Cancelado/Incidencia.
- **ADMIN-FR-013**: El sistema MUST confirmar la acción y reflejar inmediatamente el nuevo estado
  en el registro administrativo y el tracking Cliente local.
- **ADMIN-FR-014**: El sistema MUST guardar fecha del último cambio y, de ser viable para el demo,
  un registro simple de transiciones para explicar el timeline.
- **ADMIN-FR-015**: El sistema MUST bloquear una transición inválida y explicar cuál es el estado
  permitido siguiente.

### Clientes y métricas

- **ADMIN-FR-016**: Admin MUST consultar una tabla de clientes con búsqueda y columnas útiles para
  distinguir clientes sin mostrar credenciales.
- **ADMIN-FR-017**: Admin MUST consultar métricas derivadas de los datos locales: productos activos,
  alertas de stock, pedidos por estado, cantidad de clientes y total de ventas simuladas.
- **ADMIN-FR-018**: El dashboard MUST identificar que las ventas son simuladas y especificar el
  periodo o conjunto de pedidos contado.
- **ADMIN-FR-019**: El dashboard MUST mostrar estados vacíos y no calcular datos ficticios cuando
  falten registros.

## Criterios de aceptación

### Acceso

- **ADMIN-AC-001** — **Dado** un Cliente autenticado, **Cuando** inspecciona navegación y rutas,
  **Entonces** no ve la interfaz Admin y cualquier ruta administrativa directa se deniega.
- **ADMIN-AC-002** — **Dado** un intento de mutación sin sesión Admin, **Cuando** se procesa,
  **Entonces** los datos permanecen sin cambios.
- **ADMIN-AC-003** — **Dado** las credenciales predefinidas válidas, **Cuando** se autentica el
  operador, **Entonces** ve dashboard y navegación administrativa.

### Productos

- **ADMIN-AC-004** — **Dado** un Admin en productos, **Cuando** crea un producto válido de placa
  madre, GPU, procesador o computadora ensamblada, **Entonces** aparece en gestión y tienda con
  categoría, precio e inventario correctos.
- **ADMIN-AC-005** — **Dado** un formulario con precio negativo, inventario fraccional o campos
  requeridos ausentes, **Cuando** intenta guardar, **Entonces** no se persiste y se indican errores.
- **ADMIN-AC-006** — **Dado** un producto con 4 unidades, **Cuando** el dashboard recalcula
  alertas, **Entonces** cuenta ese producto como stock bajo.
- **ADMIN-AC-007** — **Dado** un producto con 5 unidades, **Cuando** se evalúan alertas,
  **Entonces** no se marca como bajo; con 0 unidades se muestra también como agotado.
- **ADMIN-AC-008** — **Dado** un producto que aparece en una orden anterior, **Cuando** Admin lo
  desactiva, **Entonces** desaparece de productos comprables y se conserva el detalle histórico.

### Logística

- **ADMIN-AC-009** — **Dado** un pedido Pendiente, **Cuando** Admin lo marca Pagado, **Entonces** la
  lista administrativa, el detalle y el historial del Cliente muestran Pagado inmediatamente.
- **ADMIN-AC-010** — **Dado** un pedido Pagado, **Cuando** Admin lo marca Enviado y luego
  Entregado, **Entonces** cada cambio queda visible en el timeline en su orden normal.
- **ADMIN-AC-011** — **Dado** un pedido terminal Entregado, **Cuando** se intenta retrocederlo a
  Pendiente, **Entonces** el sistema rechaza la transición y no modifica el pedido.
- **ADMIN-AC-012** — **Dado** un pedido con Incidencia, **Cuando** el Cliente lo consulta,
  **Entonces** la excepción se identifica sin indicar falsamente que el paquete fue entregado.
- **ADMIN-AC-013** — **Dado** un cambio logístico confirmado, **Cuando** el operador vuelve a abrir
  la orden, **Entonces** ve el estado actual y la fecha del último cambio.

### Clientes y dashboard

- **ADMIN-AC-014** — **Dado** clientes registrados, **Cuando** Admin abre la tabla, **Entonces** ve
  nombre, email y datos operativos permitidos, pero nunca passwords.
- **ADMIN-AC-015** — **Dado** pedidos y productos locales, **Cuando** Admin abre dashboard,
  **Entonces** los indicadores coinciden con los registros y ventas se etiqueta como simulada.
- **ADMIN-AC-016** — **Dado** una colección sin pedidos o clientes, **Cuando** se abre el
  dashboard, **Entonces** se muestran estados vacíos en lugar de conteos ficticios.

## Entidades y dependencias

- **Product / Category / Inventory**: Módulos 02 y 04 comparten catálogo y existencias.
- **Customer**: Módulo 01 crea perfiles; Admin consulta información permitida.
- **Order / Order Status Event**: Módulos 02 y 03 crean/presentan; Admin actualiza logística.
- **Metric**: valores agregados de registros locales; no es una fuente financiera externa.
- Dependencias: Módulo 01 para protección de rol; Módulos 02/03 para catálogo y pedidos.

## Riesgos y límites

- Una demo puramente local no puede garantizar operación concurrente entre equipos, integridad
  ante usuarios maliciosos o sincronización real-time remota.
- Métricas financieras y datos de clientes deben etiquetarse como simulados; no usar para decisiones
  comerciales reales.
- Cambios futuros de roles, cancelaciones/refunds o edición de clientes requieren reglas de
  transición, auditoría y aprobación de alcance antes de añadirse.
