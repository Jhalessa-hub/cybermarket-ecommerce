import { setupDatabase } from '../../helpers.js';
import { createCartService } from '../../../src/services/cartService.js';
import { createOrderService } from '../../../src/services/orderService.js';

export function checkoutFixture() {
  const fixture = setupDatabase();
  const { db } = fixture; db.initialize();
  db.update((data) => {
    data.Customers.push({ id: 'customer-1', name: 'Cliente Demo', email: 'demo@example.com', phone: '+51 999123456', role: 'customer',
      credential: { algorithm: 'PBKDF2-SHA256', iterations: 600000, salt: 'a'.repeat(32), hash: 'b'.repeat(64) },
      addresses: [{ id: 'address-1', recipient: 'Cliente Demo', line1: 'Calle Demo 123', city: 'Lima', region: 'Lima', postalCode: '15001', country: 'Perú' }],
      selectedAddressId: 'address-1', defaultAddressId: 'address-1' });
    data.Session = { userId: 'customer-1', email: 'demo@example.com', role: 'customer', createdAt: new Date().toISOString() };
  });
  createCartService(db).add('graphics-001', 2);
  return { ...fixture, service: createOrderService(db) };
}
