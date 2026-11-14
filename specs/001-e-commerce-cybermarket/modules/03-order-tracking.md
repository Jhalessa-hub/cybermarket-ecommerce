# Módulo 03 — Historial y seguimiento de pedidos

## Propósito

Permitir a un Cliente consultar sus pedidos y comprender su estado mediante un timeline gráfico,
accesible e interactivo. El estado se origina en checkout y puede actualizarse desde el operador
logístico Admin.

## Alcance

### Incluye

- Historial “Mis Compras” visible únicamente a Cliente autenticado.
- Resumen de pedidos con identificador, fecha, importe y estado actual.
- Detalle de pedido con productos, cantidades, dirección snapshot y total.
- Timeline normal exacto: **Pendiente → Pagado → Enviado → Entregado**.
- Estados de excepción: **Cancelado** e **Incidencia**.
- Reflejo inmediato de cambios hechos por Admin dentro del mismo entorno local.

### No incluye

- Tracking real de empresas transportistas, mapas, geolocalización, SMS o correo de notificación.
- Confirmación de pago por proveedor externo; “Pagado” es un estado demostrativo del flujo.
- Compra de invitado ni consulta pública mediante número de orden.

## Modelo funcional de estados

| Estado | Significado en la demo | Regla de presentación |
|---|---|---|
| Pendiente | Pedido registrado; aún no marcado como pagado en el flujo simulado | Estado inicial tras crear el pedido |
| Pagado | Pago marcado como completado en la simulación | No significa que hubo cobro real |
| Enviado | Operador Admin marcó el paquete como enviado | Etapas anteriores completadas; ésta activa |
| Entregado | Pedido marcado como entregado | Timeline completo |
| Cancelado | Pedido cancelado según decisión operativa | Estado terminal alternativo, no completar timeline |
| Incidencia | Existe una excepción que requiere revisión | Mostrar alerta y descripción si está disponible |

La secuencia normal es Pendiente → Pagado → Enviado → Entregado. Los cambios regulares deben
respetar el orden; una acción Admin autorizada puede cancelar o registrar una incidencia. La
resolución de Incidencia puede continuar el envío desde el estado normal actual, documentando la
actualización. No se permite revertir un pedido Entregado a una etapa previa en el flujo básico.

## Requisitos funcionales

- **ORDER-FR-001**: El sistema MUST mostrar Mis Compras solo a Cliente autenticado.
- **ORDER-FR-002**: El sistema MUST listar exclusivamente pedidos asociados al Cliente de la sesión.
- **ORDER-FR-003**: Cada resumen de pedido MUST mostrar identificador, fecha, total y estado actual.
- **ORDER-FR-004**: El detalle MUST mostrar líneas, cantidades, precios aplicados, dirección de
  envío guardada al comprar y total.
- **ORDER-FR-005**: Cada pedido MUST recibir identificador único y estado inicial Pendiente al
  generarse desde checkout.
- **ORDER-FR-006**: El timeline MUST conservar la secuencia de negocio Pendiente → Pagado → Enviado
  → Entregado. Según la decisión UI/UX aprobada para Fase 5, la presentación MUST ser vertical con
  el estado actual arriba en verde y los avances anteriores debajo en gris, en orden cronológico
  inverso. Las etapas futuras MUST aparecer separadas de los eventos ya realizados; textos e iconos
  MUST distinguir estado actual, completados y futuros sin depender solo del color.
- **ORDER-FR-007**: El sistema MUST mostrar Cancelado e Incidencia como resultados alternativos,
  claramente diferenciados de las etapas normales.
- **ORDER-FR-008**: El timeline MUST incluir texto de estado además de codificación visual/color,
  ser comprensible con lector de pantalla y permitir navegación por teclado.
- **ORDER-FR-009**: Cuando el Admin actualiza el estado, Mis Compras MUST reflejar el nuevo estado
  inmediatamente en la vista activa del mismo navegador/entorno local.
- **ORDER-FR-010**: El sistema MUST mostrar estados vacíos cuando el Cliente aún no tiene pedidos.
- **ORDER-FR-011**: Si un pedido no existe o no pertenece al Cliente de la sesión, MUST denegar su
  detalle sin revelar datos de otra persona.
- **ORDER-FR-012**: El historial MUST distinguir claramente estados simulados de una confirmación
  real de pago o de un evento real de transportista.

## Criterios de aceptación

### Historial y privacidad

- **ORDER-AC-001** — **Dado** un Cliente autenticado con dos pedidos, **Cuando** abre Mis Compras,
  **Entonces** ve ambos resúmenes con identificador, fecha, total y estado.
- **ORDER-AC-002** — **Dado** dos Clientes con pedidos diferentes, **Cuando** el primero abre el
  historial, **Entonces** no ve pedidos ni detalles pertenecientes al segundo.
- **ORDER-AC-003** — **Dado** un Cliente sin pedidos, **Cuando** abre Mis Compras, **Entonces** ve
  un estado vacío claro y una acción para volver al catálogo.
- **ORDER-AC-004** — **Dado** un visitante, **Cuando** intenta abrir Mis Compras, **Entonces** se le
  solicita iniciar sesión y no se filtra información del historial.

### Timeline

- **ORDER-AC-005** — **Dado** un pedido Pendiente, **Cuando** el Cliente abre su detalle,
  **Entonces** el timeline presenta Pendiente como estado actual, con Pagado, Enviado y Entregado
  como etapas futuras.
- **ORDER-AC-006** — **Dado** que el pedido se marca Pagado, **Cuando** se abre/actualiza su detalle,
  **Entonces** Pendiente aparece completado y Pagado aparece actual.
- **ORDER-AC-007** — **Dado** un pedido Enviado, **Cuando** se visualiza el timeline,
  **Entonces** Pendiente y Pagado aparecen completados, Enviado actual y Entregado futuro.
- **ORDER-AC-008** — **Dado** un pedido Entregado, **Cuando** se visualiza el timeline,
  **Entonces** las cuatro etapas normales aparecen completadas y Entregado se identifica como final.
- **ORDER-AC-009** — **Dado** un pedido Cancelado o con Incidencia, **Cuando** se abre el detalle,
  **Entonces** el estado alternativo se anuncia claramente y no se representa falsamente como
  Entregado.
- **ORDER-AC-010** — **Dado** un cambio de estado hecho por Admin mientras está abierto el detalle
  del Cliente, **Cuando** el cambio queda guardado, **Entonces** la etiqueta y el timeline del
  pedido muestran el nuevo estado sin esperar sincronización con un servicio externo.
- **ORDER-AC-011** — **Dado** el timeline mostrado con color e iconos, **Cuando** una persona usa
  lector de pantalla o navegación de teclado, **Entonces** puede conocer el orden y estado sin
  depender exclusivamente del color o del puntero.

### Consistencia de pedido

- **ORDER-AC-012** — **Dado** un pedido generado por checkout, **Cuando** el Cliente abre el detalle,
  **Entonces** productos, cantidades, dirección snapshot y total coinciden con la confirmación.
- **ORDER-AC-013** — **Dado** un identificador inválido o ajeno al Cliente, **Cuando** se solicita
  el detalle, **Entonces** se deniega el acceso y no se revela si pertenece a otra cuenta.

## Datos y dependencias

- **Order**: ID, customer ID, fecha, total, dirección snapshot, líneas y estado logístico.
- **Order Line**: producto snapshot, cantidad y precio unitario aplicado.
- **Order Status Event** (recomendado): estado previo/nuevo y fecha de cambio para mostrar cuándo
  ocurrió cada etapa, sin prometer cronología de carrier externo.
- Dependencias: Módulo 02 crea pedidos; Módulo 04 gestiona estados logísticos.
