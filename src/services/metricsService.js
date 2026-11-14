import { requireRole } from './authService.js';
import { DomainError, isMoney, isStock } from '../utils/validation.js';
import { orderStatuses } from '../utils/orderStatus.js';

export function calculateMetrics(data) {
  requireRole(data, 'admin');
  const active = data.Products.filter((product) => product.active);
  const salesCents = data.Orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.totalCents, 0);
  const stockUnits = active.reduce((sum, product) => sum + product.stock, 0);
  if (!isMoney(salesCents)) throw new DomainError('TOTAL', 'El importe de los pedidos supera el límite permitido para el cálculo.');
  if (!isStock(stockUnits)) throw new DomainError('TOTAL', 'Las unidades de inventario superan el límite permitido para el cálculo.');
  return {
    activeProducts: active.length,
    stockUnits,
    lowStockProducts: active.filter((product) => product.stock <= 4).sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name)),
    soldOutProducts: active.filter((product) => product.stock === 0).length,
    customers: data.Customers.length, orderCount: data.Orders.length, salesCents,
    ordersByStatus: Object.fromEntries(Object.keys(orderStatuses).map((status) => [status, data.Orders.filter((order) => order.status === status).length])),
  };
}

export function createMetricsService(database) {
  return { getMetrics() {
    const { status, data } = database.getSnapshot();
    if (status !== 'ready') throw new DomainError('NOT_READY', 'Las métricas aún no están disponibles.');
    return calculateMetrics(data);
  } };
}
