import { requireRole } from './authService.js';
import { DomainError } from '../utils/validation.js';

export function adminCustomers(data) {
  requireRole(data, 'admin');
  return data.Customers.map((customer) => ({
    id: customer.id, name: customer.name, email: customer.email, phone: customer.phone,
    createdAt: customer.createdAt ?? null,
    orderCount: data.Orders.filter((order) => order.customerId === customer.id).length,
  }));
}

export function createCustomerService(database) {
  return { listCustomers() {
    const { status, data } = database.getSnapshot();
    if (status !== 'ready') throw new DomainError('NOT_READY', 'Los clientes aún no están disponibles.');
    return adminCustomers(data);
  } };
}
