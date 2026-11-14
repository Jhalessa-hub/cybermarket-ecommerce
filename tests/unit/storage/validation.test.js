import { expect, it } from 'vitest';
import { validateAddress, validateCartLine, validateOrder, validateProfile } from '../../../src/utils/validation.js';

const address = { recipient: 'Cliente Demo', line1: 'Dirección ficticia 123', city: 'Ciudad', region: 'Región', country: 'País', postalCode: '00000' };

it('valida dirección completa y teléfono requerido para envío', () => {
  expect(() => validateAddress(address)).not.toThrow();
  expect(() => validateAddress({ ...address, city: '' })).toThrow();
  expect(() => validateProfile({ name: 'Demo', phone: '' }, { requirePhone: true })).toThrow();
});

it('valida límites de cantidad de una línea de carrito', () => {
  const product = { id: 'p1', active: true, stock: 4 };
  expect(() => validateCartLine({ productId: 'p1', quantity: 4 }, product)).not.toThrow();
  for (const quantity of [0, -1, 1.5, 5]) {
    expect(() => validateCartLine({ productId: 'p1', quantity }, product)).toThrow();
  }
});

it('valida snapshot de pedido y total consistente', () => {
  const order = { id: 'o1', customerId: 'c1', createdAt: new Date().toISOString(), totalCents: 200, shippingAddress: address, status: 'pending', lines: [{ productId: 'p1', name: 'Demo', quantity: 2, priceCents: 100 }] };
  expect(() => validateOrder(order)).not.toThrow();
  expect(() => validateOrder({ ...order, totalCents: 300 })).toThrow();
  expect(() => validateOrder({ ...order, status: 'unknown' })).toThrow();
});
