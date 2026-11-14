import { expect, it } from 'vitest';
import { createOrderService } from '../../../src/services/orderService.js';
import { ordersFixture } from './fixtures.js';

it('lista solo pedidos de la sesión Cliente, nuevos primero y sin aceptar otra identidad', () => {
  const { db, orderId } = ordersFixture();
  const service = createOrderService(db);
  expect(service.listCustomerOrders('customer-2').map((order) => order.id)).toEqual(['order-newer', orderId]);
  expect(service.getCustomerOrder('private-order')).toBeNull();
  expect(service.getCustomerOrder('does-not-exist')).toBeNull();
  expect(service.getCustomerOrder(orderId).customerId).toBe('customer-1');
});

it('consultas vuelven a comprobar identidad después de cambiar sesión', () => {
  const { db, orderId } = ordersFixture();
  const service = createOrderService(db);
  db.update((data) => { data.Session = { ...data.Session, userId: 'customer-2', email: 'private@example.com' }; });
  expect(service.listCustomerOrders().map((order) => order.id)).toEqual(['private-order']);
  expect(service.getCustomerOrder(orderId)).toBeNull();
  db.update((data) => { data.Session = null; });
  expect(() => service.listCustomerOrders()).toThrow();
  expect(() => service.getCustomerOrder(orderId)).toThrow();
  db.update((data) => { data.Session = { userId: 'admin', email: 'admin@cybermarket.com', role: 'admin', createdAt: new Date().toISOString() }; });
  expect(() => service.listCustomerOrders()).toThrow();
});
