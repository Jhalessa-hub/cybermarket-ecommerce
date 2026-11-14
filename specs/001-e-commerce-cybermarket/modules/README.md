# CyberMarket — Módulos funcionales

Estos documentos descomponen la especificación funcional por dominio para que se puedan revisar,
planificar e implementar por etapas. Cada módulo define alcance, reglas y requisitos verificables
con criterios de aceptación **Dado / Cuando / Entonces**.

## Módulos

1. [Autenticación y roles](01-auth-and-roles.md) — registro, inicio de sesión, perfil, direcciones y separación Cliente/Admin.
2. [Tienda, catálogo y carrito](02-shop-catalog-cart.md) — descubrimiento de productos, filtros, detalle técnico, carrito y checkout simulado.
3. [Pedidos y seguimiento](03-order-tracking.md) — historial del cliente y ciclo de estado visible del pedido.
4. [Gestión Admin](04-admin-management.md) — catálogo, logística, clientes y métricas.
5. [Recomendaciones de alcance](05-module-recommendations.md) — dominios que conviene separar después y orden recomendado.

## Decisiones funcionales vigentes

- La compra requiere una cuenta de Cliente autenticada; no se completa checkout como invitado.
- La navegación y las vistas Admin permanecen ocultas para visitantes y clientes.
- El acceso Admin usa el usuario predefinido `admin@cybermarket.com` y la contraseña `admin123`;
  el registro público no permite crear cuentas Admin.
- Catálogo inicial: computadoras ensambladas y componentes de PC, empezando por placas madre,
  tarjetas gráficas y procesadores.
- Alerta de stock bajo: inventario menor o igual a 4 unidades.
- Timeline vigente solicitado: **Pendiente → Pagado → Enviado → Entregado**, más excepciones
  Cancelado/Incidencia. Sustituye la propuesta de timeline anterior.
- “Actualización inmediata/en tiempo real” significa que el cambio de estado aparece de inmediato
  en las vistas de esta sesión/demostración local; no implica sincronización entre dispositivos.
- Checkout y pagos son una simulación: no se ingresan ni guardan credenciales reales de pago.

## Orden de trabajo sugerido

1. Catálogo inicial y datos de producto.
2. Registro, sesión y perfil; establecer guards de rutas por rol antes de exponer operaciones.
3. Carrito, validación de inventario y checkout que crea el pedido.
4. Historial y timeline usando los pedidos creados.
5. Operaciones Admin, métricas derivadas de datos existentes y pruebas de aislamiento de roles.

La constitución del proyecto prevalece sobre estos módulos. En especial, cualquier cambio que
convierta la demo en un sistema de pagos o autenticación de producción requiere una decisión de
alcance separada.
