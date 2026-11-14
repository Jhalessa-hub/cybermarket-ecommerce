# Módulo 02 — Tienda, catálogo y carrito

## Propósito

Facilitar el descubrimiento y evaluación de computadoras ensambladas y componentes para PC, y
permitir a una persona armar un carrito persistente que pueda confirmar después de autenticarse.

## Alcance

### Incluye

- Portada `/` con hero destacado, categorías horizontales y catálogo responsive a todo el ancho,
  sin barra lateral inicial. Cuatro columnas en escritorio y cinco en pantallas amplias.
- Vistas dedicadas `/search` y `/catalog` con filtros laterales; en móvil, controles desplegables.
- Categorías iniciales: computadoras ensambladas, placas madre, tarjetas gráficas y procesadores;
  la estructura permite incorporar otros componentes compatibles posteriormente.
- Búsqueda de texto y filtros acumulativos por categoría, rango de precio, disponibilidad y
  especificaciones aplicables al producto.
- Modal de detalle accesible con descripción, precio, inventario disponible, imágenes y
  especificaciones técnicas.
- Carrito lateral persistente con cantidades, subtotales, eliminación y total estimado.
- Checkout simulado asociado a cliente autenticado, dirección “Enviar a…” y confirmación explícita.

### No incluye

- Cobro real, captura de tarjeta, pasarela externa ni almacenamiento de credenciales de pago.
- Sincronización del carrito entre dispositivos o stock global compartido.
- Comparador avanzado de builds, recomendación automática de compatibilidad o configurador de PC
  completo; se recomiendan como expansión futura.

## Reglas funcionales

1. La interfaz comercial se adapta a la pantalla: navegación, cards, filtros y carrito no requieren
   desplazamiento horizontal de página en anchos móviles comunes.
2. La búsqueda y los filtros se acumulan con lógica AND entre criterios (p. ej. categoría y rango
   de precio) y OR dentro de una selección múltiple de valores de un mismo filtro.
3. Cambiar o limpiar un criterio recalcula resultados sin borrar los otros criterios activos.
4. Las especificaciones dependen de categoría. Ejemplos: procesador (socket, núcleos, frecuencia),
   GPU (memoria VRAM, interfaz, dimensiones), placa madre (socket, chipset, formato, memoria).
   La ausencia de un dato opcional no debe romper la ficha del producto.
5. El carrito conserva las líneas si se recarga la página y al visitante se le solicita iniciar
   sesión para checkout. La persistencia es local al navegador.
6. La cantidad no puede ser menor que 1 ni exceder inventario disponible. Existencias se vuelven
   a validar al checkout porque pueden haber cambiado desde que el producto entró al carrito.
7. Los totales deben usar los precios vigentes en la confirmación; cambios de precio se informan
   antes de crear el pedido. El módulo puede mostrar subtotal y total simulado, pero no inventar
   cargos de envío/impuestos no definidos.
8. El checkout muestra resumen, dirección seleccionada, cantidades, importes y carácter simulado;
   el botón final expresa claramente que confirmará un pedido demostrativo.
9. El flujo no solicita número de tarjeta, CVV, PIN, datos bancarios ni credenciales externas.
10. El resultado satisfactorio genera un pedido y vacía el carrito confirmado; si falla la
    confirmación, conserva el carrito y explica el motivo.
11. Inicio es una portada de tienda, no una vista de búsqueda: el hero y el catálogo aprovechan
    todo el ancho disponible. «Filtrar catálogo» y las categorías llevan a la vista dedicada.
12. El buscador principal está en la navegación Cliente. Al interactuar o escribir se abre la vista
    de búsqueda manteniendo el foco y el término. No se muestran filtros laterales en Inicio.
13. Búsqueda, filtros acumulativos y orden se representan en parámetros URL. Recargar o volver atrás
    restaura los criterios; volver a Inicio muestra una portada limpia sin borrar datos del usuario.

## Requisitos funcionales

### Catálogo y búsqueda

- **SHOP-FR-001**: El sistema MUST mostrar productos activos en un catálogo adaptable, con nombre,
  categoría, imagen, precio, estado de disponibilidad y acceso al detalle.
- **SHOP-FR-002**: El sistema MUST iniciar con las categorías de computadoras ensambladas, placas
  madre, tarjetas gráficas y procesadores.
- **SHOP-FR-003**: El sistema MUST permitir búsqueda por texto sobre nombre y descripción, ignorando
  diferencias de mayúsculas/minúsculas y espacios externos.
- **SHOP-FR-004**: El sistema MUST permitir filtros por categoría, precio mínimo/máximo,
  disponibilidad y atributos técnicos cuando esos atributos existan.
- **SHOP-FR-005**: Los filtros MUST ser acumulativos; limpiar un filtro MUST mantener los restantes.
- **SHOP-FR-006**: La búsqueda y filtros MUST exponer recuento de resultados, filtros activos y
  acciones para limpiar uno o todos.
- **SHOP-FR-007**: El sistema MUST representar resultados vacíos, producto sin inventario e imagen
  no disponible con estados alternativos comprensibles.
- **SHOP-FR-026**: Inicio `/` MUST mostrar hero, acceso «Filtrar catálogo», categorías y cuadrícula
  completa de 4–5 columnas en escritorio, adaptada a móvil, sin barra lateral inicial.
- **SHOP-FR-027**: La barra lateral MUST mostrarse solo en `/search` y `/catalog`, accesibles desde
  el buscador, una categoría o el acceso de filtrado. En móvil MUST poder desplegarse sin obligar a
  recorrer todos los filtros antes de ver resultados.
- **SHOP-FR-028**: Los parámetros URL MUST conservar texto, selecciones, precios, atributos técnicos
  y orden al recargar/navegar atrás; abrir una categoría MUST preseleccionar su filtro.
- **SHOP-FR-029**: La navegación del buscador MUST conservar el foco de escritura. La separación
  visual MUST preservar detalle modal, carrito, permisos, imágenes y persistencia existentes.

### Detalle de producto

- **SHOP-FR-008**: El sistema MUST permitir abrir un modal de detalle de producto desde la card.
- **SHOP-FR-009**: El detalle MUST mostrar descripción, precio, disponibilidad, imágenes y
  especificaciones técnicas por categoría cuando estén disponibles.
- **SHOP-FR-010**: El modal MUST cerrarse con botón visible, tecla Escape y acción accesible; al
  cerrarse, el foco vuelve al control que lo abrió.
- **SHOP-FR-011**: El modal MUST mostrar descripciones legibles y no tratar campos técnicos
  ausentes como errores fatales.

### Carrito

- **SHOP-FR-012**: El sistema MUST permitir añadir producto disponible al carrito desde catálogo y
  desde detalle.
- **SHOP-FR-013**: El carrito MUST permitir cambiar cantidad y eliminar una línea, con validación
  contra stock y total actualizado.
- **SHOP-FR-014**: El carrito MUST mostrar producto, cantidad, precio unitario, subtotal de línea,
  subtotal general y total del flujo simulado.
- **SHOP-FR-015**: El carrito lateral MUST persistir al navegar y recargar dentro del mismo navegador.
- **SHOP-FR-016**: El sistema MUST mostrar estado vacío de carrito y acción para volver a la tienda.
- **SHOP-FR-017**: El sistema MUST preservar el contenido del carrito durante login/registro y
  después de retornar a checkout.
- **SHOP-FR-018**: El sistema MUST avisar y corregir la cantidad/remover la línea si el inventario
  cambió y ya no permite la cantidad solicitada.

### Checkout simulado

- **SHOP-FR-019**: El sistema MUST permitir checkout solo con sesión Cliente, datos de envío válidos
  y carrito no vacío.
- **SHOP-FR-020**: El checkout MUST mostrar resumen final y dirección seleccionable con “Enviar a…”.
- **SHOP-FR-021**: El checkout MUST solicitar confirmación explícita antes de crear el pedido.
- **SHOP-FR-022**: El sistema MUST informar claramente que el pago es simulado y MUST NOT solicitar,
  transmitir ni guardar información real de pago.
- **SHOP-FR-023**: Al confirmar, el sistema MUST generar un pedido con líneas, precios aplicados,
  cantidad, dirección, total, identificador y fecha; el estado inicial se define en el Módulo 03.
- **SHOP-FR-024**: Tras confirmación satisfactoria, MUST vaciar solo el carrito confirmado y ofrecer
  enlace a Mis Compras.
- **SHOP-FR-025**: Si la confirmación falla por inventario/datos, MUST conservar el carrito y
  presentar una acción correctiva específica.

## Criterios de aceptación

### Catálogo y filtros

- **SHOP-AC-001** — **Dado** un catálogo con productos de varias categorías, **Cuando** una persona
  visita la tienda desde un móvil o escritorio, **Entonces** las cards y controles se adaptan al
  ancho de pantalla y permiten consultar los productos.
- **SHOP-AC-002** — **Dado** productos con diferentes precios y categorías, **Cuando** se aplica
  búsqueda, categoría y precio, **Entonces** se muestran solo los productos que cumplen todos los
  criterios activos.
- **SHOP-AC-003** — **Dado** filtros de categoría y precio activos, **Cuando** se elimina solo el
  filtro de precio, **Entonces** la categoría permanece activa y los resultados se recalculan.
- **SHOP-AC-004** — **Dado** una búsqueda sin coincidencias, **Cuando** se presentan resultados,
  **Entonces** se comunica que no hubo resultados y se puede limpiar búsqueda/filtros.

### Detalle

- **SHOP-AC-005** — **Dado** una card de producto, **Cuando** se activa su detalle, **Entonces** se
  abre un modal con imagen, precio, inventario, descripción y especificaciones disponibles.
- **SHOP-AC-006** — **Dado** un modal abierto, **Cuando** se pulsa Escape o se activa cerrar,
  **Entonces** se cierra y el foco regresa a la card que lo abrió.
- **SHOP-AC-007** — **Dado** un producto al que le faltan especificaciones opcionales, **Cuando** se
  abre el detalle, **Entonces** se muestran los datos disponibles sin campos rotos ni valores
  falsos.

### Carrito y checkout

- **SHOP-AC-008** — **Dado** un producto disponible, **Cuando** el cliente lo agrega al carrito,
  **Entonces** la línea aparece con cantidad inicial 1 y subtotal correcto.
- **SHOP-AC-009** — **Dado** una línea en carrito, **Cuando** se modifica cantidad o se elimina,
  **Entonces** el subtotal y total se actualizan y no se permite cantidad mayor al inventario.
- **SHOP-AC-010** — **Dado** un carrito con artículos, **Cuando** se recarga la página o se abre
  otra ruta, **Entonces** su contenido sigue disponible en el mismo navegador.
- **SHOP-AC-011** — **Dado** un visitante con artículos en carrito, **Cuando** selecciona checkout,
  **Entonces** se solicita login/registro y, al autenticarse, el mismo carrito sigue intacto.
- **SHOP-AC-012** — **Dado** un cliente con sesión, dirección válida y productos disponibles,
  **Cuando** revisa checkout, **Entonces** ve artículos, cantidades, importes, dirección “Enviar
  a…” y aviso visible de pago simulado.
- **SHOP-AC-013** — **Dado** el checkout simulado, **Cuando** se confirma el pedido, **Entonces** se
  crea un pedido una sola vez, el carrito confirmado se vacía y aparece confirmación con enlace a
  Mis Compras.
- **SHOP-AC-014** — **Dado** inventario insuficiente en el último paso, **Cuando** se confirma,
  **Entonces** no se crea un pedido inválido, se conserva el carrito y se identifica el artículo a
  corregir.
- **SHOP-AC-015** — **Dado** el flujo de checkout, **Cuando** se revisan sus campos, **Entonces** no
  existe campo para tarjeta, CVV, PIN o credencial de pago real.

### Portada y vista de búsqueda

- **SHOP-AC-016** — Al abrir Inicio se ve el hero y la cuadrícula completa, sin filtros laterales.
- **SHOP-AC-017** — Al enfocar o escribir en el buscador se abre `/search` sin perder foco o texto.
- **SHOP-AC-018** — Al elegir una categoría se abre `/catalog` con el filtro preseleccionado.
- **SHOP-AC-019** — Abrir `/search` o `/catalog` directamente permite filtrar; la URL restaura los
  criterios tras recarga o navegación atrás, con el mismo resultado y orden.
- **SHOP-AC-020** — En móvil no hay desbordamiento horizontal y los filtros se pueden desplegar.

## Arquitectura visual

- `src/pages/Home.jsx`: entrada de Inicio; `StoreHero.jsx`: banner con recurso local.
- `src/pages/Catalog.jsx`: entrada compartida por `/search` y `/catalog`.
- `src/pages/StorePage.jsx`: composición reutilizable de catálogo, estados, detalle y carrito;
  variante de portada sin filtros y variante de búsqueda con barra lateral.
- `src/components/navigation/CustomerNavigation.jsx` y `CatalogSearch.jsx`: navegación y buscador
  principal. No existe un `Navbar.jsx` independiente en esta aplicación.
- `useCatalogLocation` y `catalogLocation.js`: lectura/escritura de criterios en la URL;
  `useCatalog` conserva las reglas compartidas, sin acceder al almacenamiento.
- No se migra ni se reinicia la base local por esta refactorización de presentación.

## Entidades y dependencias

- **Product**: nombre, descripción, categoría, imagen, precio, inventario, disponibilidad y
  atributos técnicos.
- **Cart / Cart Line**: producto, cantidad y precio mostrado; el precio se vuelve a confirmar
  antes del pedido.
- **Order / Order Line**: se crean al checkout satisfactorio y se consumen en tracking.
- **Customer / Address**: Módulo 01 proporciona la identidad y destino de envío.
- Dependencias: Módulo 01 para cuenta/direcciones y Módulo 03 para entidad/presentación del pedido.
