# Módulo 01 — Autenticación, roles y perfil

## Propósito

Permitir que visitantes creen una cuenta Cliente o inicien sesión, administrar los datos necesarios
para el envío y separar estrictamente las capacidades Cliente y Admin. El acceso y los datos son
locales y demostrativos, conforme a la constitución CyberMarket.

## Alcance

### Incluye

- Formulario de inicio de sesión con Email y Password.
- Formulario de registro rápido con Nombre, Email y Password.
- Sesión Cliente y sesión Admin diferenciadas e independientes por pestaña normal.
- Acceso Admin con las credenciales predefinidas, sin registro público de Admin.
- Perfil Cliente: nombre, email, teléfono y direcciones de envío.
- Selección de una dirección para checkout, expresada como “Enviar a…”.
- Ocultamiento visual y protección de páginas/acciones Admin para Cliente y visitante.

### No incluye

- Recuperación por email, OAuth, MFA ni verificación por correo: no hay backend/correo externo.
- Autenticación segura de producción. `localStorage` y credenciales fijas son exclusivamente para
  demostración académica y no protegen datos reales.
- Comprar sin autenticación: el visitante puede navegar y preparar carrito, pero no confirmar
  checkout sin iniciar sesión o registrarse.

## Reglas funcionales

1. El registro crea únicamente cuentas Cliente. No se ofrece selector de rol ni se aceptan valores
   de rol privilegiados enviados desde formularios de Cliente.
2. Las credenciales Admin son `admin@cybermarket.com` / `admin123`. Si coinciden, la sesión se
   identifica como Admin; si no, nunca se eleva el rol de una cuenta Cliente.
3. Todo acceso Admin requiere comprobar la sesión/rol al entrar a la vista y al ejecutar cada
   operación protegida. Ocultar un enlace por sí solo no constituye autorización suficiente.
4. La barra de navegación de Cliente y visitante no muestra “Admin”, dashboard, operador logístico
   ni enlaces equivalentes. No deben aparecer en menús móviles, pie de página ni resultados de
   búsqueda interna.
5. Si un visitante intenta ir a checkout, se conserva el carrito y se solicita login o registro.
6. Las direcciones contienen como mínimo destinatario, línea de dirección, ciudad, región/estado,
   código postal y país. El teléfono del perfil se valida como campo requerido para el envío.
7. El cliente puede guardar varias direcciones y marcar una como predeterminada. En checkout puede
   elegir la dirección del pedido mediante el control “Enviar a…”. El pedido conserva una copia
   de la dirección elegida para que cambios futuros del perfil no alteren compras anteriores.
8. Los formularios deben explicar errores junto al campo correspondiente y no revelar si el email
   de otra persona está registrado al fallar login.

## Requisitos funcionales

- **AUTH-FR-001**: El formulario de Login MUST solicitar Email y Password y validar ambos campos
  antes de autenticar.
- **AUTH-FR-002**: El formulario de Registro rápido MUST solicitar Nombre, Email y Password;
  debe validar formato de email, campos requeridos y política mínima de contraseña comunicada en
  la interfaz.
- **AUTH-FR-003**: El sistema MUST crear cuentas de rol Cliente únicamente mediante el registro
  público y MUST evitar la asignación de Admin desde dicho formulario.
- **AUTH-FR-004**: El sistema MUST autenticar la cuenta Admin solo con las credenciales predefinidas
  `admin@cybermarket.com` / `admin123` y crear el contexto Admin sin habilitar registro Admin.
- **AUTH-FR-005**: El sistema MUST permitir cerrar sesión y eliminar el acceso a las vistas privadas
  al terminarla.
- **AUTH-FR-006**: El sistema MUST ocultar por completo la interfaz de navegación Admin a Cliente y
  visitante y MUST denegar rutas y operaciones Admin cuando el rol no sea Admin.
- **AUTH-FR-007**: El sistema MUST conservar la intención de checkout y el carrito al enviar al
  visitante a autenticarse, y permitirle continuar al regresar con sesión Cliente.
- **AUTH-FR-008**: El perfil MUST permitir consultar y actualizar Nombre/teléfono, además de crear,
  editar, eliminar y seleccionar direcciones de envío.
- **AUTH-FR-009**: Checkout MUST poder seleccionar una dirección guardada mediante la acción
  “Enviar a…” y MUST permitir añadir una nueva si todavía no hay una dirección válida.
- **AUTH-FR-010**: Los datos de la dirección seleccionada MUST quedar asociados como snapshot del
  pedido confirmado.
- **AUTH-FR-011**: El sistema MUST comunicar que la autenticación es local y demostrativa, no un
  mecanismo seguro para cuentas o información real.
- **AUTH-FR-012**: La Session activa MUST guardarse como `cybermarket_session` en `sessionStorage`;
  login/logout MUST afectar solo a la pestaña actual y la recarga MUST conservar su identidad.
- **AUTH-FR-013**: Customers, Products y Orders MUST permanecer compartidos en `localStorage`.
  Eventos `storage` de `cybermarket_customers`, `cybermarket_products`, `cybermarket_orders` y la base
  canónica MUST actualizar ambos Contexts sin recargar ni cambiar la identidad de otras pestañas.
- **AUTH-FR-014**: Entrar directamente a `/admin` o sus subrutas sin Admin en esa pestaña MUST
  redirigir a `/login?mode=admin`, incluso con un Cliente autenticado allí. El formulario MUST
  admitir únicamente las credenciales Admin y conservar el destino administrativo seguro.
- **AUTH-FR-015**: Migrar la antigua Session compartida MUST retirar su identidad sin heredársela
  a nuevas pestañas ni borrar clientes, pedidos o inventario. Fallos de persistencia MUST impedir
  anunciar login/registro exitoso; la autorización de servicios MUST usar la Session de su pestaña.

## Criterios de aceptación

### Login y registro

- **AUTH-AC-001** — **Dado** un visitante en Login, **Cuando** introduce credenciales válidas de
  Cliente y envía el formulario, **Entonces** entra como Cliente y accede a sus opciones privadas.
- **AUTH-AC-002** — **Dado** un visitante en Login, **Cuando** introduce una combinación inválida,
  **Entonces** se rechaza el acceso y se muestra un mensaje genérico y accesible.
- **AUTH-AC-003** — **Dado** un visitante en Registro, **Cuando** completa Nombre, Email y Password
  con valores válidos, **Entonces** se crea una cuenta Cliente y no una cuenta Admin.
- **AUTH-AC-004** — **Dado** un formulario incompleto o con email mal formado, **Cuando** se envía,
  **Entonces** no se crea sesión ni cuenta y se identifican los campos que requieren corrección.
- **AUTH-AC-005** — **Dado** un visitante, **Cuando** intenta registrarse usando el email Admin
  como una cuenta Cliente, **Entonces** el sistema no crea una identidad que pueda suplantar o
  degradar el rol Admin.

### Separación de roles

- **AUTH-AC-006** — **Dado** un visitante o Cliente, **Cuando** ve la navegación en escritorio o
  móvil, **Entonces** no existe elemento, icono o enlace visible a Admin.
- **AUTH-AC-007** — **Dado** un Cliente que abre manualmente una URL administrativa, **Cuando** la
  aplicación procesa la navegación, **Entonces** deniega la vista y redirige a una ubicación segura.
- **AUTH-AC-008** — **Dado** un Cliente que intenta ejecutar una acción administrativa, **Cuando**
  se evalúa la acción, **Entonces** no se modifica ningún producto, pedido ni dato de cliente.
- **AUTH-AC-009** — **Dado** el email y contraseña Admin predefinidos, **Cuando** se autentican,
  **Entonces** la sesión obtiene únicamente las capacidades Admin autorizadas.
- **AUTH-AC-010** — **Dado** un Admin autenticado, **Cuando** cierra sesión, **Entonces** desaparece
  su acceso Admin y las vistas protegidas vuelven a denegarse.

### Perfil y envío

- **AUTH-AC-011** — **Dado** un Cliente autenticado, **Cuando** guarda teléfono y una dirección
  válida, **Entonces** aparecen disponibles al abrir “Enviar a…” durante checkout.
- **AUTH-AC-012** — **Dado** varias direcciones guardadas, **Cuando** el Cliente selecciona una,
  **Entonces** esa dirección se identifica como destino del pedido actual.
- **AUTH-AC-013** — **Dado** que un pedido ya fue creado, **Cuando** el Cliente edita su dirección
  de perfil, **Entonces** la dirección histórica del pedido permanece intacta.
- **AUTH-AC-014** — **Dado** un visitante que inicia checkout, **Cuando** se le solicita
  autenticación, **Entonces** después de registrarse/iniciar sesión puede continuar con el carrito
  y no se le obliga a reconstruirlo.

### Pestañas paralelas y migración

- **AUTH-AC-015** — **Dado** un Cliente autenticado, **Cuando** otra pestaña normal del mismo
  origen/perfil entra a `/admin` e inicia sesión Admin, **Entonces** ambas conservan sus roles y
  cerrar sesión en cualquiera no cambia la otra.
- **AUTH-AC-016** — **Dado** Cliente y Admin abiertos, **Cuando** Cliente compra y Admin actualiza
  el estado o un producto, **Entonces** dashboard, seguimiento y catálogo se actualizan sin recargar.
- **AUTH-AC-017** — **Dado** una pestaña autenticada, **Cuando** se recarga, **Entonces** mantiene
  su identidad; una nueva pestaña sin `sessionStorage` previo empieza anónima.
- **AUTH-AC-018** — **Dado** una base con Session compartida antigua, **Cuando** se abre la app,
  **Entonces** solicita login por pestaña sin eliminar cuentas/pedidos ni heredar permisos Admin.
- **AUTH-AC-019** — **Dado** un fallo de `sessionStorage` o del guardado del registro, **Cuando**
  se intenta autenticar/registrar, **Entonces** se informa el fallo sin éxito ni login fantasma.

## Datos y dependencias

- **Customer**: nombre, email, contraseña de demo/credencial local, teléfono, rol y direcciones;
  compartido en la base canónica y su proyección `cybermarket_customers` en `localStorage`.
- **Address**: destinatario, dirección, ciudad, región, código postal, país y preferencia.
- **Session**: identidad y rol actual en `sessionStorage.cybermarket_session`; se invalida solo en
  la pestaña actual. El campo compartido legado se guarda como `null`. Duplicar una pestaña puede
  copiar inicialmente su Session, pero posteriores login/logout permanecen independientes.
- **Order address snapshot**: copia de la dirección seleccionada asociada al pedido.
- Dependencia funcional: carrito compartido con Módulo 02 y pedidos compartidos con Módulo 03.

## Riesgos y notas de seguridad

- El almacenamiento local y las credenciales fijas no son autenticación real. No guardar datos
  personales sensibles ni utilizar esta solución para comercio real.
- Las reglas de autorización deben aplicarse tanto al renderizar la vista como a la mutación de
  datos. Para production, la autorización y la gestión de sesiones requieren backend confiable.
- No almacenar ni mostrar passwords después del registro/login.
