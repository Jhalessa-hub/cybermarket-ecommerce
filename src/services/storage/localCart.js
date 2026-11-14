import { CART_KEY, validateCart } from './databaseSchema.js';
import { DomainError } from '../../utils/validation.js';

// La única lectura/escritura del carrito se realiza desde la capa storage del repositorio.
export function readLocalCart(storage, orders = []) {
  const raw = storage.getItem(CART_KEY);
  if (raw === null) return { version: 1, lines: [] };
  let cart;
  try { cart = validateCart(JSON.parse(raw)); }
  catch { throw new DomainError('CART_CORRUPT', 'El carrito local no se pudo leer. No se ha borrado.'); }
  // Compatibilidad con carritos anteriores: asignar identidad sin cambiar sus artículos.
  if (cart.lines.length && !cart.checkoutToken) {
    cart.checkoutToken = crypto.randomUUID();
    writeLocalCart(storage, cart);
  }
  // El pedido es el recibo duradero. Permite completar la segunda escritura tras un fallo/recarga.
  if (cart.checkoutToken && orders.some((order) => order.cartToken === cart.checkoutToken)) {
    cart = { version: 1, lines: [] };
    try { writeLocalCart(storage, cart); }
    catch { throw new DomainError('CART_CLEANUP', 'Tu pedido ya está guardado, pero no se pudo actualizar el carrito. Reintenta sin borrar datos; no es necesario volver a comprar.'); }
  }
  return cart;
}
export function writeLocalCart(storage, cart) {
  validateCart(cart);
  storage.setItem(CART_KEY, JSON.stringify(cart));
}
