import { requireRole } from './authService.js';
import { DomainError, isText, validateAddress, validateCartLine, validateOrder, validateProfile } from '../utils/validation.js';
import { summarizeCart } from './cartService.js';
import { allowedOrderTransitions } from '../utils/orderStatus.js';

function shippingSnapshot(address) {
  validateAddress(address);
  return Object.fromEntries(['id', 'recipient', 'line1', 'city', 'region', 'postalCode', 'country'].map((field) => [field, address[field]]));
}

function review(data, cart, addressId) {
  const session = requireRole(data, 'customer');
  const customer = data.Customers.find((item) => item.id === session.userId);
  validateProfile(customer, { requirePhone: true });
  const address = customer.addresses.find((item) => item.id === addressId);
  if (!address) throw new DomainError('ADDRESS', 'Selecciona o guarda una dirección de envío válida antes de continuar.');
  if (!cart.lines.length) throw new DomainError('EMPTY_CART', 'Tu carrito está vacío. Añade productos antes de continuar.');
  for (const line of cart.lines) {
    const product = data.Products.find((item) => item.id === line.productId);
    try { validateCartLine(line, product); }
    catch { throw new DomainError('STOCK', `${product?.name ?? 'Un artículo'} no tiene existencias suficientes. Revisa tu carrito.`); }
  }
  const summary = summarizeCart(cart.lines, data.Products);
  return {
    cartToken: cart.checkoutToken,
    customerId: session.userId,
    contactPhone: customer.phone,
    shippingAddress: shippingSnapshot(address),
    lines: summary.lines.map(({ product, quantity }) => ({ productId: product.id, name: product.name, priceCents: product.priceCents, quantity })),
    totalCents: summary.totalCents,
  };
}

export function createOrderService(database) {
  function readyData() {
    const snapshot = database.getSnapshot();
    if (snapshot.status !== 'ready') throw new DomainError('NOT_READY', 'Espera a que se carguen los datos o reintenta.');
    return snapshot.data;
  }
  return {
    listAdminOrders() { const data = readyData(); requireRole(data, 'admin'); return data.Orders; },
    updateOrderStatus(orderId, input = {}) {
      return database.update((data) => {
        requireRole(data, 'admin');
        if (input.confirmed !== true) throw new DomainError('CONFIRM_REQUIRED', 'Confirma el cambio antes de guardar.');
        const order = data.Orders.find((item) => item.id === orderId);
        if (!order) throw new DomainError('NOT_FOUND', 'No se encontró el pedido.');
        if (!Number.isSafeInteger(order.statusRevision ?? 0) || (order.statusRevision ?? 0) < 0 || order.statusRevision === Number.MAX_SAFE_INTEGER) throw new DomainError('VALIDATION', 'No se puede actualizar la revisión de este pedido. Sus datos se han conservado.');
        if (order.status !== input.expectedStatus || (order.statusRevision ?? 0) !== input.expectedRevision) throw new DomainError('CONFLICT', 'El pedido ha cambiado. Actualiza la vista y revisa el estado antes de confirmar.');
        if (!allowedOrderTransitions(order).includes(input.status)) throw new DomainError('TRANSITION', 'Ese cambio no está permitido desde el estado actual. Sigue la secuencia de estados indicada.');
        const description = typeof input.description === 'string' ? input.description.trim() : '';
        if ((['cancelled', 'incident'].includes(input.status) && !description) || description.length > 1000) throw new DomainError('VALIDATION', 'Indica un motivo de hasta 1000 caracteres.', { description: 'El motivo es obligatorio para Cancelado e Incidencia (máximo 1000 caracteres).' });
        const createdAt = new Date().toISOString();
        if (input.status === 'incident') order.resumeStatus = order.status;
        if (order.status === 'incident' && input.status !== 'incident') delete order.resumeStatus;
        const event = { id: crypto.randomUUID(), previousStatus: order.status, status: input.status, createdAt, actor: 'admin', description };
        order.events = [...(Array.isArray(order.events) ? order.events : [{ status: 'pending', createdAt: order.createdAt }]), event];
        order.status = input.status;
        order.statusRevision = (order.statusRevision ?? 0) + 1;
        order.updatedAt = createdAt;
        return structuredClone(order);
      });
    },
    listCustomerOrders() { return customerOrders(readyData()); },
    getCustomerOrder(orderId) {
      return customerOrders(readyData()).find((order) => order.id === orderId) ?? null;
    },
    reviewCheckout(addressId) {
      const snapshot = database.getSnapshot();
      if (snapshot.status !== 'ready') throw new DomainError('NOT_READY', 'Espera a que se carguen los datos o reintenta.');
      return review(snapshot.data, snapshot.cart, addressId);
    },
    confirmCheckout(accepted) {
      if (!isText(accepted?.cartToken) || !accepted?.shippingAddress?.id || !Array.isArray(accepted?.lines)) {
        throw new DomainError('CONFIRM_REQUIRED', 'Revisa el resumen y confirma la compra antes de continuar.');
      }
      const order = database.update((data, cart) => {
        const session = requireRole(data, 'customer');
        const existing = data.Orders.find((item) => item.cartToken === accepted.cartToken);
        if (existing) {
          if (existing.customerId !== session.userId) throw new DomainError('FORBIDDEN', 'No tienes permiso para realizar esta operación.');
          return structuredClone(existing);
        }
        if (cart.checkoutToken !== accepted.cartToken) throw new DomainError('CART_CHANGED', 'Tu carrito ha cambiado. Revisa los artículos y confirma de nuevo.');
        const current = review(data, cart, accepted.shippingAddress.id);
        if (current.contactPhone !== accepted.contactPhone) throw new DomainError('PHONE_CHANGED', 'El teléfono de contacto ha cambiado. Revisa los datos de envío y confirma de nuevo.');
        if (JSON.stringify(current.shippingAddress) !== JSON.stringify(accepted.shippingAddress)) {
          throw new DomainError('ADDRESS_CHANGED', 'La dirección ha cambiado. Revísala antes de confirmar de nuevo.');
        }
        if (JSON.stringify(current.lines) !== JSON.stringify(accepted.lines) || current.totalCents !== accepted.totalCents) {
          throw new DomainError('PRICE_CHANGED', 'Han cambiado los artículos o sus precios. Revisa el nuevo resumen y confirma de nuevo.');
        }
        const createdAt = new Date().toISOString();
        const result = {
          id: crypto.randomUUID(), customerId: session.userId, cartToken: current.cartToken,
          createdAt, currency: 'USD', status: 'pending', paymentMode: 'demo',
          lines: current.lines, shippingAddress: current.shippingAddress, totalCents: current.totalCents,
          contactPhone: current.contactPhone,
          events: [{ status: 'pending', createdAt }],
        };
        validateOrder(result);
        for (const line of result.lines) data.Products.find((product) => product.id === line.productId).stock -= line.quantity;
        data.Orders.push(result);
        return structuredClone(result);
      }, { withCart: true });
      // No revertir un pedido ya persistido si falla la limpieza independiente del carrito.
      const refreshed = database.retry();
      return { order, cleanupPending: refreshed.status !== 'ready' };
    },
  };
}

// La identidad se toma de la sesión, nunca de un customerId aportado por la UI.
export function customerOrders(data) {
  const session = requireRole(data, 'customer');
  return data.Orders.filter((order) => order.customerId === session.userId)
    .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) || a.id.localeCompare(b.id));
}
