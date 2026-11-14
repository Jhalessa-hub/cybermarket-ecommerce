import { checkoutFixture } from '../checkout/fixtures.js';

export function ordersFixture() {
  const fixture = checkoutFixture();
  const { db, service } = fixture;
  const { order } = service.confirmCheckout(service.reviewCheckout('address-1'));
  db.update((data) => {
    data.Orders[0].createdAt = '2026-11-01T10:00:00.000Z';
    data.Orders[0].events = [{ status: 'pending', createdAt: data.Orders[0].createdAt }];
    data.Customers.push({ ...structuredClone(data.Customers[0]), id: 'customer-2', email: 'private@example.com' });
    data.Orders.push({ ...structuredClone(data.Orders[0]), id: 'order-newer', cartToken: 'newer-token', createdAt: '2026-11-02T10:00:00.000Z', events: [{ status: 'pending', createdAt: '2026-11-02T10:00:00.000Z' }] });
    data.Orders.push({ ...structuredClone(data.Orders[0]), id: 'private-order', cartToken: 'private-token', customerId: 'customer-2', shippingAddress: { ...data.Orders[0].shippingAddress, line1: 'Dirección privada' }, lines: [{ ...data.Orders[0].lines[0], name: 'Artículo privado' }] });
  });
  return { ...fixture, orderId: order.id };
}
