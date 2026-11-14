# Recomendaciones — Dominios adicionales y alcance por fases

## Hallazgo

Los cuatro módulos pedidos cubren el recorrido académico esencial Cliente/Admin: identidad,
descubrimiento, carrito/checkout, seguimiento, operación de catálogo, clientes y métricas. Para una
tienda real, algunas responsabilidades normalmente se separan porque tienen reglas propias. No
conviene implementar todas en el primer incremento: se recomienda mantenerlas como módulos
posteriores con criterios de entrada claros.

## Módulos recomendados

### Prioridad siguiente (útil incluso para una demo académica)

#### 05. Checkout y ciclo de pedido

**Por qué separarlo:** Checkout tiene validación de dirección, precio e inventario, confirmación,
creación sin duplicados y reglas de estado. Ahora se incluye parcialmente en catálogo/carrito para
mantener el número inicial de dominios bajo; si el documento crece, conviene trasladar esa sección
a un módulo propio `05-checkout-and-order-lifecycle.md` y dejar catálogo/carrito enfocado en compra
previa.

**Alcance futuro:** revisión final, dirección/envío, resumen total, confirmación simulada,
consistencia del stock, pedido creado una sola vez, carrito tras error y estado inicial.

#### 06. Inventario y taxonomía técnica de PC

**Por qué separarlo:** vender piezas de PC requiere atributos distintos por categoría y evitar
fichas incompletas o incompatibles. Esta necesidad crece rápido cuando se incorporan fuentes de
alimentación, RAM, almacenamiento, gabinetes y refrigeración.

**Alcance futuro:** modelo de atributos por tipo de producto, categorías/subcategorías, unidades,
alertas, ajustes de stock y, opcionalmente, validación de compatibilidad entre socket, formato,
memoria, dimensiones y consumo.

**Recomendación de contención:** en MVP usar atributos técnicos descriptivos y dejar el
configurador automático de compatibilidad fuera del alcance hasta que el catálogo esté definido.

### Prioridad posterior (solo si la rúbrica o el producto lo requieren)

#### 07. Devoluciones, cancelaciones y reembolsos simulados

Separar solicitudes del cliente, elegibilidad por estado/tiempo, aprobación Admin, motivo y estado
de devolución. No añadir reembolsos al checkout inicial: el pago no es real y el dominio debe
permanecer explícitamente simulado.

#### 08. Promociones, descuentos y wishlist

Cupones, reglas de vigencia, límites de uso y lista de deseos aportan valor comercial, pero añaden
reglas de cálculo y persistencia. Incorporar solo después de estabilizar precio, carrito y pedidos.

#### 09. Notificaciones y auditoría operativa

Historial de quién/cómo cambió estados, confirmaciones de pedido y avisos locales de actualización.
En la arquitectura actual debe ser una bitácora local, no email/SMS real.

## No se recomienda incluir todavía

- Pasarela bancaria, tarjetas, pagos reales, integración con transportistas, sincronización cloud,
  analítica de terceros o recuperación de contraseña por email: contradicen las restricciones de
  no backend y demo local.
- Guest checkout: estudios de usabilidad de Baymard recomiendan ofrecerlo para reducir fricción,
  pero el requerimiento confirmado de CyberMarket exige cuenta para comprar. Mantener la decisión
  actual para satisfacer la rúbrica; registrarlo como trade-off que solo cambia con aprobación.
- Configurador de PC con compatibilidad automática hasta que se definan productos, atributos y
  reglas verificables suficientes.

## Secuencia sugerida para evitar saturación

1. Definir las entidades y el vocabulario de categorías/producto, pedido y estados.
2. Completar y revisar Módulo 01, evitando diseñar la seguridad como mera ocultación visual.
3. Completar catálogo y carrito con datos semilla pequeños pero realistas.
4. Acordar el límite entre checkout y pedido antes de implementar; extraerlo a módulo propio si
   las reglas exceden los criterios actuales.
5. Implementar seguimiento usando el mismo modelo de estados que Admin; no duplicar etiquetas o
   reglas entre pantallas.
6. Añadir CRUD/logística y después métricas, que dependen de datos previos.
7. Dejar promociones, devoluciones y compatibilidad automatizada como incrementos independientes.

## Investigación y referencias

- [Baymard Institute — Cart & Checkout Usability Research](https://baymard.com/research/checkout-usability):
  investiga flujos de checkout, usuarios autenticados, creación de cuenta y checkout de invitado.
  Se utiliza como referencia UX, no como sustituto de la decisión funcional del proyecto.
- [Baymard Institute — Make “Guest Checkout” Prominent](https://baymard.com/research-articles/make-guest-checkout-prominent):
  referencia para el trade-off de exigir cuenta; la decisión de CyberMarket permanece compra con
  cuenta por requerimiento explícito.
- [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html):
  respalda comprobar permisos en cada operación y no confiar solo en ocultar controles.
- [OWASP — Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html):
  referencia general para flujos de autenticación; la implementación local aquí es solo una demo y
  no debe considerarse conforme a producción.
- [OWASP — Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html):
  referencia para el ciclo de vida de sesión; una sesión guardada en `localStorage` no equivale a
  una sesión de servidor segura.

## Recomendación final

Mantener estos cuatro módulos como MVP de definición funcional y añadir el módulo de checkout
independiente solo cuando se pase a planificación si los criterios de total, dirección, stock y
creación del pedido necesitan detalle adicional. El candidato de mayor valor técnico para una
tienda de componentes es inventario/taxonomía; la compatibilidad automática debe quedar fuera del
primer alcance para no convertir el MVP en un configurador de PC.
